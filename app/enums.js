var Enums = {};

Enums.service = {
    ROUTINE: 0,
    SCHOOL: 1,
    SIA: 2,
    OTHER: 3,
    options: [
        { 'label': 'Routine Immunization', word: 'Routine', 'short': 'RI' },
        { 'label': 'School Immunization', word: 'School', 'short': 'SI' },
        { 'label': 'Supplementary Immunization Activities', word: 'SIA', 'short': 'SIA' },
        { 'label': 'Other Immunization', word: 'Other', 'short': 'OI' }
    ]};

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
        { label: '- 25° C', colour: '#1f77b4' },
        { label: '+ 5° C', colour: '#bcbd22' },
        { label: '+ 25° C', colour: '#d62728' }
    ]
};

Enums.charts = {
    VOLPERCOURSE: 0,
    VOLPERLEVEL: 1,
    VOLTABLE: 2,
    options: [
        { label: 'Volume per course',
          template: 'bar-chart',
          controller: 'chart1' },
        { label: 'Aggregated volume per level',
          template: 'chart2',
          controller: 'chart2' },
        { label: 'Volume per level as table',
          template: 'volume-table',
          controller: 'volume-table' }
    ]
};

export default Enums;
