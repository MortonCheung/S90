import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [stage, title, status, ...sections] = process.argv.slice(2);
if (!stage || !title || !['PASS','FAIL','BLOCKED','UNVERIFIED'].includes(status)) {
  throw new Error('Provide stage, title, verified status, and report paragraphs');
}
const sha = execFileSync('git', ['rev-parse','HEAD'], {encoding:'utf8'}).trim();
const branch = execFileSync('git', ['branch','--show-current'], {encoding:'utf8'}).trim();
fs.mkdirSync('docs/reports/v4', {recursive:true});
fs.writeFileSync(`docs/reports/v4/STAGE-${stage}.md`, `# ${stage} · ${title}

- 开始分支 \`${branch}\`
- 开始 SHA \`${sha}\`
- 验收结果 ${status}
- 阶段提交通过 git log --grep="v4 stage ${stage}" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

${sections.join('\n\n')}
`);
