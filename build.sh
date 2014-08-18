#!/bin/bash

cd $(dirname $0)
ember build --environment development

pushd dist
zip -FS -r ../epi.zip *
popd
