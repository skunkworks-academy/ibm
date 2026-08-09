import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const fail = (message) => {
  console.error(`COURSE INTEGRITY ERROR: ${message}`);
  process.exitCode = 1;
};

const objectives = read('src/data/objectives.ts');
const assessment = read('src/data/assessmentBank.ts');
const incidents = read('src/components/IncidentLab.tsx');
const parts = [1, 2, 3, 4].map((number) => read(`docs/part-${number}.mdx`));

const unitIds = [...objectives.matchAll(/id:\s*'(p[1-4]u\d+)'/g)].map((match) => match[1]);
if (unitIds.length !== 16 || new Set(unitIds).size !== 16) fail(`Expected 16 unique official unit IDs, found ${unitIds.length}/${new Set(unitIds).size}.`);

const objectiveBlocks = [...objectives.matchAll(/objectives\('p[1-4]u\d+'\s*,\s*\[([\s\S]*?)\]\)/g)];
const objectiveTotal = objectiveBlocks.reduce((sum, match) => sum + (match[1].match(/^\s*'/gm)?.length ?? 0), 0);
if (objectiveBlocks.length !== 16) fail(`Expected 16 objective blocks, found ${objectiveBlocks.length}.`);
if (objectiveTotal !== 76) fail(`Expected 76 source-aligned objectives, found ${objectiveTotal}.`);

const questionMatches = [...assessment.matchAll(/q\('([^']+)'\s*,\s*'(part-[1-4])'\s*,\s*'(p[1-4]u\d+)'\s*,\s*'(p[1-4]u\d+-o\d+)'/g)];
if (questionMatches.length !== 64) fail(`Expected 64 assessment questions, found ${questionMatches.length}.`);
if (new Set(questionMatches.map((match) => match[1])).size !== questionMatches.length) fail('Assessment question IDs are not unique.');

for (const [, questionId, , unitId, objectiveId] of questionMatches) {
  if (!unitIds.includes(unitId)) fail(`Question ${questionId} references unknown unit ${unitId}.`);
  if (!objectiveId.startsWith(`${unitId}-`)) fail(`Question ${questionId} maps objective ${objectiveId} to mismatched unit ${unitId}.`);
}

for (const unitId of unitIds) {
  const count = questionMatches.filter((match) => match[3] === unitId).length;
  if (count !== 4) fail(`Expected four questions for ${unitId}, found ${count}.`);
}

const incidentIds = [...incidents.matchAll(/id:\s*'(incident-[^']+)'/g)].map((match) => match[1]);
if (incidentIds.length !== 12 || new Set(incidentIds).size !== 12) fail(`Expected 12 unique incidents, found ${incidentIds.length}/${new Set(incidentIds).size}.`);

const requiredChecks = {
  1: ['p1u1-check','p1u2-check','p1u3-check','p1u4-check','p1u5-check','p1u6-check','part-1-evidence'],
  2: ['p2u1-check','p2u2-check','p2u3-check','part-2-evidence'],
  3: ['p3u1-check','p3u2-check','p3u3-check','part-3-evidence'],
  4: ['p4u1-check','p4u2-check','p4u3-check','p4u4-check','part-4-evidence'],
};

for (const [partNumber, ids] of Object.entries(requiredChecks)) {
  const doc = parts[Number(partNumber) - 1];
  for (const id of ids) if (!doc.includes(id)) fail(`Part ${partNumber} is missing mastery ID ${id}.`);
}

if (!process.exitCode) {
  console.log(`CLA96G integrity OK: ${objectiveTotal} objectives across ${unitIds.length} official units, ${questionMatches.length} assessment questions, ${incidentIds.length} incidents, mastery IDs present.`);
}
