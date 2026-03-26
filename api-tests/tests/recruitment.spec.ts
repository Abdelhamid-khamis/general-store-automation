/**
 * OrangeHRM Recruitment API — End-to-End Suite
 *
 * Flow:
 *   TC_API_001  POST   /api/v2/recruitment/candidates  — add a new candidate
 *   TC_API_002  GET    /api/v2/recruitment/candidates  — verify it appears in the list
 *   TC_API_003  DELETE /api/v2/recruitment/candidates  — remove it and confirm deletion
 *
 * A shared APIRequestContext is created once in beforeAll so the login session
 * cookie persists across all three tests.
 */

import {
  test,
  expect,
  APIRequestContext,
  request as playwrightRequest,
} from '@playwright/test';
import { OrangeHRMClient, CandidateRecord } from '../utils/orangehrmClient';
import candidateFixture from '../fixtures/candidateData.json';

const BASE_URL =
  process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com';

test.describe.serial('OrangeHRM Recruitment API', () => {
  let requestContext: APIRequestContext;
  let client: OrangeHRMClient;
  let createdCandidate: CandidateRecord | undefined;

  // Unique email per run to avoid duplicate-email conflicts on the demo site
  const candidate = {
    ...candidateFixture,
    email: `jane.doe.${Date.now()}@automation.test`,
  };

  // ─── Session setup ───────────────────────────────────────────────────────

  test.beforeAll(async () => {
    requestContext = await playwrightRequest.newContext({
      baseURL: BASE_URL,
      ignoreHTTPSErrors: true,
    });
    client = new OrangeHRMClient(requestContext);
    await client.login();
    console.log('\nLogin successful — session established\n');
  });

  test.afterAll(async () => {
    await requestContext.dispose();
  });

  // ─── TC_API_001: Add candidate ───────────────────────────────────────────

  test('TC_API_001 — Add candidate via POST /api/v2/recruitment/candidates', async () => {
    console.log(
      `Adding candidate: ${candidate.firstName} ${candidate.lastName} <${candidate.email}>`,
    );

    createdCandidate = await client.addCandidate(candidate);

    console.log(`Candidate created — ID: ${createdCandidate.id}`);
    console.log(`URL: ${BASE_URL}/web/index.php/recruitment/viewCandidate/${createdCandidate.id}`);

    expect(createdCandidate.id).toBeGreaterThan(0);
    expect(createdCandidate.firstName).toBe(candidate.firstName);
    expect(createdCandidate.middleName).toBe(candidate.middleName ?? '');
    expect(createdCandidate.lastName).toBe(candidate.lastName);
    expect(createdCandidate.email).toBe(candidate.email);
  });

  // ─── TC_API_002: Verify candidate appears in list ────────────────────────

  test('TC_API_002 — Verify candidate in GET /api/v2/recruitment/candidates', async () => {
    expect(createdCandidate, 'TC_API_001 must pass and create a candidate first').toBeDefined();

    const candidates = await client.listCandidates();
    const found = candidates.find(c => c.id === createdCandidate!.id);

    console.log(
      `Searched list of ${candidates.length} candidates — ` +
        `${found ? 'FOUND' : 'NOT FOUND'} ID ${createdCandidate!.id}`,
    );

    expect(found).toBeDefined();
    expect(found!.firstName).toBe(candidate.firstName);
    expect(found!.lastName).toBe(candidate.lastName);
    expect(found!.email).toBe(candidate.email);
  });

  // ─── TC_API_003: Delete candidate and verify removal ─────────────────────

  test('TC_API_003 — Delete candidate via DELETE /api/v2/recruitment/candidates', async () => {
    expect(createdCandidate, 'TC_API_001 must pass and create a candidate first').toBeDefined();

    await client.deleteCandidates([createdCandidate!.id]);
    console.log(`Candidate ${createdCandidate!.id} deleted`);

    // Confirm the record no longer appears in the list
    const candidates = await client.listCandidates();
    const found = candidates.find(c => c.id === createdCandidate!.id);

    expect(found).toBeUndefined();
    console.log(`Deletion confirmed — ID ${createdCandidate!.id} absent from candidate list`);
  });
});
