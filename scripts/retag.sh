#!/bin/bash

git tag -d $1
git tag $1
git push origin :$1
git push origin $1
git fetch --tags