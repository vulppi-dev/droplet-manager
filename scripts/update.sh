#!/usr/bin/env bash

aptitude update
aptitude upgrade -y
aptitude clean
apt autoremove -y
apt autoclean
snap refresh

npm --location=global add \
rollup \
rollup-plugin-terser \
tslib \
typescript \
@rollup/plugin-commonjs \
@rollup/plugin-node-resolve \
@rollup/plugin-typescript