var Enums = {};

Enums.service = {
    ROUTINE: 0,
    SCHOOL: 1,
    SIA: 2,
    OTHER: 3,
    options: [
        { id: 0, 'label': 'Routine Immunization', word: 'Routine', 'short': 'RI' },
        { id: 1, 'label': 'School Immunization', word: 'School', 'short': 'SI' },
        { id: 2, 'label': 'Supplementary Immunization Activities', word: 'SIA', 'short': 'SIA' },
        { id: 3, 'label': 'Other Immunization', word: 'Other', 'short': 'OI' }
    ]
};

Enums.packing = {
    PRIMARY: 0,
    SECONDARY: 1,
    TERTIARY: 2,
    PASSIVECOOLED: 3,
    options: [
        { label: 'Primary', factor: 2.0 },
        { label: 'Secondary', factor: 1.0 },
        { label: 'Tertiary', factor: 3.0 },
        { label: 'Passive cooled', factor: 5.0 }
    ]
};

Enums.temperature = {
    MINUS25: 0,
    PLUS5: 1,
    PLUS25: 2,
    options: [
        { id: 0, label: '- 25° C', colour: '#1f77b4' },
        { id: 1, label: '+ 5° C', colour: '#bcbd22' },
        { id: 2, label: '+ 25° C', colour: '#d62728' }
    ]
};

Enums.charts = {
    VOLPERCOURSE: 0,
    VOLPERLEVEL: 1,
    VOLTABLE: 2,
    options: [
        { label: 'Volume per course chart',
          title: 'Volume in secondary packaging of a complete series'
          + ' of immunization in cubic cms as a chart',
          template: 'chart1',
          controller: 'chart1' },
        { label: 'Lts. net storage volume chart',
          title: 'Lts. net storage volume per level, temperature and'
          + ' service for the reference population as a chart',
          template: 'chart2',
          controller: 'chart2' },
        { label: 'Lts. net storage volume table',
          title: 'Lts. net storage volume per level, temperature and'
          + ' service for the reference population as a table',
          template: 'volume-table',
          controller: 'volume-table' }
    ]
};

export default Enums;
