var App = window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

App.Enums = {};

App.Enums.service = {
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

App.Enums.packing = {
    PRIMARY: 0,
    SECONDARY: 1,
    TERTIARY: 2,
    PASSIVECOOLED: 3,
    options: [
        { label: 'Primary', factor: 1. },
        { label: 'Secondary', factor: 1. },
        { label: 'Tertiary', factor: 1. },
        { label: 'Passive cooled', factor: 0. }
    ]
};

App.Enums.temperature = {
    MINUS25: 0,
    MINUS5: 1,
    PLUS5: 2,
    options: [
        { label: '- 25° C' },
        { label: '- 5° C' },
        { label: '+ 5° C' }
    ]
};

App.Enums.charts = {
    VOLPERCOURSE: 0,
    VOLPERLEVEL: 1,
    options: [
        { label: 'Volume per course', template: 'chart1' },
        { label: 'Aggregated volume per level', template: 'chart2' }
    ]
};

/* Order and include as you please. */
require('scripts/components/*');
require('scripts/controllers/*');
require('scripts/store');
require('scripts/models/*');
require('scripts/routes/*');
require('scripts/views/*');
require('scripts/router');
