const path = require('path');
const {writeOutputFile, copyToClipboard, fetchAndParseCSV} = require("./utils");

const csvUrl = 'https://docs.google.com/spreadsheets/d/1D3V15hz2pW_Or9iCVGGAhC62PuxRG4IyQGT9yqjG4gU/export?format=csv&gid=0';
const outputFile = path.join(__dirname, 'output.md');

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

function entryTemplate({
  circle,
  description,
  importance,
  playbookLink,
  role,
  thisYearContact,
}) {
  const title = `# ${role}`;

  const metadataTable = `
| Circle       | 👇 Contact to apply 👇 |
| ------------ | --------------- |
| ${circle}    | ${thisYearContact || '@samzmann'} |
`;

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
${metadataTable}
${importanceNotice}
${formattedDescription}
${learnMore}
${separator}
`;
}

const getPageIntroMarkdown = () => {
  return `
# Open Lead/Realizer roles for Kiez Burn 2023!
This is a list of important roles that need to be filled to make Kiez Burn happen.
It’s publicly available at 👉[ wiki.kiezburn.org/s/kb23-jobs](https://wiki.kiezburn.org/s/kb23-jobs) 👈 Please share!

### 🥳 If you find an interesting role…
→ Apply for the role by reaching out to the contact person listed in the job post.
### 😪 Otherwise…
→ That’s fine. You could still support KB23 by sharing the link to this page to people around you. Just copy paste this message and send away:
> Hey! Kiez Burn 2023 is starting to take form. They still got some open roles in the orga team.
> Take a look at wiki.kiezburn.org/s/kb23-jobs and find a way to contribute! ✌️

### For Leads
If you wanna post an open role to this page, read the documentation [here](https://wiki.kiezburn.org/doc/start-here-Fape6wAzmN).

------------

# Tickets
⚠️ We are holding tickets for people who take on important orga roles. If you wanna support but could not purchase a ticket, reach out to @samzmann and we will make a ticket available for you!

`
}

const getHighPriorityRolesMarkdown = (entries) => {
  const highPriorityEntries = entries.filter((entry) => entry.Status === "Open" && entry.Importance.startsWith("1 - Event critical"))

  if (highPriorityEntries.length === 0) {
    return ""
  }

  let markdown = `## Super high priority roles\n\n`

  highPriorityEntries.forEach((entry) => {
    markdown += `🔴 ${entry.Role}\n\n`
  })

  return markdown
}


// Format the data as Markdown
function formatMarkdown(entries) {
  let markdown = getPageIntroMarkdown();

  markdown += getHighPriorityRolesMarkdown(entries);

  entries.forEach((entry) => {
    const {
      'Playbook link': playbookLink,
      'This year contact': thisYearContact,
      Circle,
      Description,
      Importance,
      Role,
      Status
    } = entry;

    if (Status !== "Open") {
      return
    }

    const formattedEntry = entryTemplate({
      circle: Circle,
      description: Description,
      importance: Importance,
      playbookLink,
      role: Role,
      thisYearContact,
    });
    markdown += formattedEntry;
  });
  return markdown;
}

async function fetchFileAndFormatMarkdown() {
  const records = await fetchAndParseCSV(csvUrl)

  const markdown = formatMarkdown(records);
  writeOutputFile(outputFile, markdown)
  await copyToClipboard(markdown);
}

fetchFileAndFormatMarkdown().then().catch()
