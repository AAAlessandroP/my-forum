#!/bin/sh

cd redis-5.0.8/src
make distclean
make MALLOC=libc
./redis-server

