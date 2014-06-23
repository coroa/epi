var Enums = {};

Enums.service = {
    ROUTINE: 0,
    SCHOOL: 1,
    SIA: 2,
    OTHER: 3,
    options: [
        { 'label': 'Routine Immunization' },
        { 'label': 'School Immunization' },
        { 'label': 'S. Immunization A.' },
        { 'label': 'Other Immunization' }
    ]};

Enums.packing = {
    PRIMARY: 0,
    SECONDARY: 1,
    TERTIARY: 2,
    PASSIVECOOLED: 3,
    options: [
        { label: 'Primary', factor: 1.0 },
        { label: 'Secondary', factor: 1.0 },
        { label: 'Tertiary', factor: 1.0 },
        { label: 'Passive cooled', factor: 0.0 }
    ]
};

Enums.temperature = {
    MINUS25: 0,
    MINUS5: 1,
    PLUS5: 2,
    options: [
        { label: '- 25° C' },
        { label: '- 5° C' },
        { label: '+ 5° C' }
    ]
};

Enums.charts = {
    VOLPERCOURSE: 0,
    VOLPERLEVEL: 1,
    options: [
        { label: 'Volume per course',
          template: 'bar-chart',
          controller: 'chart1' },
        { label: 'Aggregated volume per level',
          template: 'bar-chart',
          controller: 'chart2' }
    ]
};

export default Enums;
