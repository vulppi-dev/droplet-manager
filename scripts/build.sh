#!/usr/bin/env bash

cd $BUILD_PATH && git clone $HOST $NAME

APP_PATH=$BUILD_PATH/$NAME

if [ -f `$APP_PATH/package.json` ]; then
  npm --prefix=$APP_PATH --production=false i
  npm --prefix=$BUILD_PATH/$NAME run build

  if [ -f $BUILD_PATH/$NAME/dist/index.js ]; then
    rimraf $APPS_PATH/$NAME
    mkdir -p $APPS_PATH/$NAME
    cp -r $BUILD_PATH/$NAME/dist $APPS_PATH/$NAME/
    cp $BUILD_PATH/$NAME/package.json $APPS_PATH/$NAME/
    npm --prefix=$APPS_PATH/$NAME i
  fi

  pm2 delete $NAME
  cd $APPS_PATH/$NAME && pm2 start --name $NAME --update-env npm -- start
  pm2 save
fi

rm -rf $APP_PATH