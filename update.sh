#!/usr/bin/env bash

aptitude update
aptitude upgrade -y
aptitude clean
apt autoremove -y
apt autoclean
snap refresh