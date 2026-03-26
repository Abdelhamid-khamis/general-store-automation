import { APIRequestContext } from '@playwright/test';

const USERNAME = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const PASSWORD = process.env.ORANGEHRM_PASSWORD ?? 'admin123';

export interface Candidate {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  comment?: string;
  consentToKeepData?: boolean;
}

export interface CandidateRecord {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string | null;
  comment: string | null;
  consentToKeepData: boolean;
}

/**
 * Thin HTTP client for the OrangeHRM REST API.
 * Uses Playwright's APIRequestContext so the session cookie is stored and
 * replayed automatically across calls — no manual cookie jar needed.
 */
export class OrangeHRMClient {
  constructor(private readonly request: APIRequestContext) {}

  // ─── Auth ────────────────────────────────────────────────────────────────

  async login(): Promise<void> {
    // 1. Load the login page to harvest the CSRF token embedded as a Vue prop:
    //    <auth-login :token="&quot;TOKEN_VALUE&quot;" ...>
    const loginPage = await this.request.get('/web/index.php/auth/login');
    if (!loginPage.ok()) {
      throw new Error(`Login page unreachable: HTTP ${loginPage.status()}`);
    }

    const html = await loginPage.text();
    const tokenMatch = html.match(/:token="&quot;([^&]+)&quot;"/);
    if (!tokenMatch) {
      throw new Error('CSRF _token not found in login page — page structure may have changed');
    }

    // 2. Submit credentials — success sets the session cookie automatically
    const validateRes = await this.request.post('/web/index.php/auth/validate', {
      form: {
        username: USERNAME,
        password: PASSWORD,
        _token: tokenMatch[1],
      },
    });

    if (!validateRes.url().includes('/dashboard')) {
      throw new Error('Login failed — did not redirect to dashboard. Check credentials.');
    }
  }

  // ─── Recruitment Candidates ───────────────────────────────────────────────

  /**
   * POST /api/v2/recruitment/candidates
   * Adds a new candidate and returns the created record.
   */
  async addCandidate(candidate: Candidate): Promise<CandidateRecord> {
    const res = await this.request.post('/web/index.php/api/v2/recruitment/candidates', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        firstName: candidate.firstName,
        middleName: candidate.middleName ?? '',
        lastName: candidate.lastName,
        email: candidate.email,
        contactNumber: candidate.contactNumber ?? '',
        comment: candidate.comment ?? '',
        consentToKeepData: candidate.consentToKeepData ?? false,
      },
    });

    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Add candidate failed — HTTP ${res.status()}: ${body}`);
    }

    const json = await res.json() as { data: CandidateRecord };
    return json.data;
  }

  /**
   * GET /api/v2/recruitment/candidates
   * Returns up to 50 candidates ordered by application date descending.
   */
  async listCandidates(): Promise<CandidateRecord[]> {
    const res = await this.request.get('/web/index.php/api/v2/recruitment/candidates', {
      params: {
        limit: 50,
        offset: 0,
        sortField: 'candidate.dateOfApplication',
        sortOrder: 'DESC',
      },
    });

    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`List candidates failed — HTTP ${res.status()}: ${body}`);
    }

    const json = await res.json() as { data: CandidateRecord[] };
    return json.data;
  }

  /**
   * DELETE /api/v2/recruitment/candidates
   * Deletes one or more candidates by ID.
   */
  async deleteCandidates(ids: number[]): Promise<void> {
    const res = await this.request.delete('/web/index.php/api/v2/recruitment/candidates', {
      headers: { 'Content-Type': 'application/json' },
      data: { ids },
    });

    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Delete candidates failed — HTTP ${res.status()}: ${body}`);
    }
  }
}
