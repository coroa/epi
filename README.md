# EPI

A decision-support tool for stronger immunization programs.

This [DHIS2](http://www.dhis2.org/) based web-app provides a visual
aid for estimating the cold storage capacity requirements of a
country's vaccine supply chain. The user is guided through choosing
the distributed vaccines and their distribution parameters nation-wide
as well as per level of organisation units.

The resulting required storage volume for a hierarchy of organisation
units and their populations - retrieved from DHIS2 and its CCEI
(ColdChain Equipment Inventory) module - are then compared to the
actual storage capacity, with a set of updating charts.

The ember/ember-data combo is used to build a rich javascript
application which only communicates with a DHIS2 installation by
making REST-calls to its
[Web-API](https://www.dhis2.org/doc/snapshot/en/user/html/ch32.html).

The design and development of the workflow is a result of a GSoC 2014
project under the umbrella of HISP, with the help of PATH and in
communication with WHO representatives.

Development continues even after the end of the GSoC in the Github
repository at https://www.github.com/coroa/epi, feel free to drop
issues and questions there.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

The application expects a local DHIS2 installation with the CCEI
module. Check their [page](http://www.dhis2.org) and
[documentation](https://www.dhis2.org/doc/snapshot/en/implementer/html/ch08.html)
on how to set these up. You should be able to also use DHIS2 Live, but
you have to include the CCEI module manually, then.

* `ember serve`
* Visit your app at http://localhost:4200.

## Running Tests

The test coverage basically amounts to zero for now. But as soon, as
there are tests, that's how you run them.

* `ember test`
* `ember test --server`

## Building

* `ember build`, or
* `./build.sh` to pack the resulting dist directly into a web-app conformant zip file.

For more information on using ember-cli, visit [http://iamstef.net/ember-cli/](http://iamstef.net/ember-cli/).
