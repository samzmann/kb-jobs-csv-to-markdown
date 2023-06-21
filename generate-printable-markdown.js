const path = require('path');
const {writeOutputFile, copyToClipboard, fetchAndParseCSV} = require("./utils");

const csvUrl = 'https://docs.google.com/spreadsheets/d/1D3V15hz2pW_Or9iCVGGAhC62PuxRG4IyQGT9yqjG4gU/export?format=csv&gid=0';
const outputFile = path.join(__dirname, 'print.md');

const formatImportanceNotice = (importance) => {
  const [level, label] = importance.split(' - ');
  if (level === '1') {
    return `**Importance:** 🔥 ${label} (aka This MUST be done for KB to happen!)\n`;
  }
  if (level === '2') {
    return `**Importance:** ✋ ${label} (aka Shit will get nasty if this is not done...)\n`;
  }
  if (level === '3') {
    return `**Importance:** ${label} (This is kinda taken care of, but we'd really appreciate support!)\n`;
  }
  return ""
}

function getCircleNameMarkdown(circle) {
  return `# ${circle.toUpperCase()}\n`
}

function entryTemplate({
 description,
 importance,
 playbookLink,
 role,
}) {
  const title = `## ${role}`;

  const importanceNotice = importance
    ? formatImportanceNotice(importance)
    : "";

  const formattedDescription = description
    .replace("Main responsibilities:", "### Main responsibilities")
    .replace("Requirements:", "### Requirements")

  const learnMore = playbookLink
    ? `## Learn more\n${playbookLink}\n`
    : "";

  const separator = `
  
  ------
  
  `;

  return `
${title}
${importanceNotice}
${formattedDescription}
${learnMore}
${separator}
`;
}


// Format the data as Markdown
async function formatMarkdown(entries) {
  let markdown = ''

  let circle = ''

  entries.forEach((entry) => {
    const {
      'Playbook link': playbookLink,
      Circle,
      Description,
      Importance,
      Role,
      Status
    } = entry;

    if (Status !== "Open") {
      return
    }

    if (circle !== Circle) {
      markdown += getCircleNameMarkdown(Circle)
      circle = Circle
    }

    const formattedEntry = entryTemplate({
      description: Description,
      importance: Importance,
      playbookLink,
      role: Role,
    });
    markdown += formattedEntry;
  });

  return markdown;
}

async function fetchFileAndFormatMarkdown() {
  const records = await fetchAndParseCSV(csvUrl)

  const markdown = await formatMarkdown(records);
  writeOutputFile(outputFile, markdown)
  await copyToClipboard(markdown);
}

fetchFileAndFormatMarkdown().then().catch()
