
const LEGAL_DATA = {
  "United States": {
    jurisdiction: "California",
    laws: [
      {
        title: "California Family Code Section 6700",
        topic: "Minors and contracts",
        summary:
          "A minor may make a contract in the same manner as an adult, subject to legal restrictions and the power of disaffirmance.",
        url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=FAM&sectionNum=6700."
      },
      {
        title: "California Family Code Section 6710",
        topic: "Disaffirmance of contracts",
        summary:
          "A minor's contract may generally be disaffirmed before majority or within a reasonable time afterward, subject to statutory exceptions.",
        url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=FAM&sectionNum=6710."
      },
      {
        title: "California Family Code Section 6712",
        topic: "Necessaries",
        summary:
          "Certain contracts for the reasonable value of necessary support may not be disaffirmed when the statutory requirements are met.",
        url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=FAM&sectionNum=6712."
      },
      {
        title: "California Family Code Section 7050",
        topic: "Emancipation",
        summary:
          "An emancipated minor is treated as an adult for specified legal purposes, including entering binding contracts.",
        url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=FAM&sectionNum=7050."
      }
    ]
  },

  Uzbekistan: {
    jurisdiction: "Uzbekistan",
    laws: [
      {
        title: "Civil Code of Uzbekistan, Article 22",
        topic: "Full civil capacity",
        summary:
          "Full civil capacity generally begins at age 18. A person who legally marries before reaching majority acquires full civil capacity from the time of marriage.",
        url: "https://lex.uz/en/docs/111181"
      }
    ]
  }
};

module.exports = LEGAL_DATA;
