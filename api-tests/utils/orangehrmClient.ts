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
 * Uses Playwright's APIRequestContext so cookies are stored and replayed
 * automatically across calls — no manual cookie jar needed.
 */
export class OrangeHRMClient {
  private xsrfToken = '';

  constructor(private readonly request: APIRequestContext) {}

  // ─── Auth ────────────────────────────────────────────────────────────────

  async login(): Promise<void> {
    // 1. Load the login page to harvest the hidden CSRF _token field
    const loginPage = await this.request.get('/web/index.php/auth/login');
    if (!loginPage.ok()) {
      throw new Error(`Login page unreachable: HTTP ${loginPage.status()}`);
    }

    const html = await loginPage.text();

    // OrangeHRM v5.x is a Vue SPA — the CSRF token is embedded as a Vue component prop:
    // <auth-login :token="&quot;TOKEN_VALUE&quot;" ...>
    const tokenMatch = html.match(/:token="&quot;([^&]+)&quot;"/);

    if (!tokenMatch) {
      throw new Error('CSRF _token not found in login page — page structure may have changed');
    }

    // 2. Submit credentials as a form POST
    await this.request.post('/web/index.php/auth/validate', {
      form: {
        username: USERNAME,
        password: PASSWORD,
        _token: tokenMatch[1],
      },
    });

    // 3. Extract the XSRF-TOKEN cookie that the REST API requires as a header
    const state = await this.request.storageState();
    const xsrfCookie = state.cookies.find(c => c.name === 'XSRF-TOKEN');
    if (!xsrfCookie) {
      throw new Error(
        'XSRF-TOKEN cookie not set after login — credentials may be wrong or the demo site may be down',
      );
    }
    this.xsrfToken = decodeURIComponent(xsrfCookie.value);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private get apiHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': this.xsrfToken,
    };
  }

  // ─── Recruitment Candidates ───────────────────────────────────────────────

  /**
   * POST /api/v2/recruitment/candidates
   * Adds a new candidate and returns the created record.
   */
  async addCandidate(candidate: Candidate): Promise<CandidateRecord> {
    const res = await this.request.post('/web/index.php/api/v2/recruitment/candidates', {
      headers: this.apiHeaders,
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
      headers: this.apiHeaders,
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
      headers: this.apiHeaders,
      data: { ids },
    });

    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Delete candidates failed — HTTP ${res.status()}: ${body}`);
    }
  }
}
