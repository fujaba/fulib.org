#!/usr/bin/env sh
case "$GITHUB_REF" in
  refs/tags/v*) TAG="${GITHUB_REF##*/}" ;;
  *) TAG=latest ;;
esac
echo "Docker Tag: $TAG"
echo "tag=$TAG" >> $GITHUB_OUTPUT
V_VERSION="$(git describe --tags)"
VERSION="${V_VERSION#v}"
echo "version=$VERSION" >> $GITHUB_OUTPUT
echo "Git Describe Version: $VERSION"
