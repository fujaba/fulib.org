import {FileType} from './file-type';

export const DEFAULT: FileType = {
  name: 'File',
  extensions: [],
  icon: 'file-earmark',
  mode: 'download',
};

export const FILE_TYPES: Record<string, FileType> = {
  archive: {
    name: 'Archive',
    extensions: ['.zip', '.jar'],
    icon: 'file-zip',
    mode: 'download',
  },
  gradle: {
    name: 'Gradle',
    extensions: ['.gradle'],
    icon: 'gear',
    mode: 'text/x-groovy',
  },
  html: {
    name: 'HTML',
    extensions: ['.htm', '.html'],
    icon: 'file-earmark-richtext',
    mode: 'text/html',
    previewMode: 'iframe',
  },
  ignore: {
    name: 'Ignore',
    extensions: ['.gitignore'],
    icon: 'file-earmark-text',
    mode: 'text/plain',
  },
  java: {
    name: 'Java',
    extensions: ['.java'],
    icon: 'file-earmark-code',
    mode: 'text/x-java',
  },
  json: {
    name: 'JSON',
    extensions: ['.json'],
    icon: 'file-earmark-code',
    mode: 'application/json',
  },
  javascript: {
    name: 'JavaScript',
    extensions: ['.js', '.jsx'],
    icon: 'file-earmark-code',
    mode: 'text/javascript',
  },
  markdown: {
    name: 'Markdown',
    extensions: ['.md'],
    icon: 'markdown',
    mode: 'text/x-markdown',
    previewMode: 'markdown',
  },
  png: {
    name: 'PNG Image',
    extensions: ['.png'],
    icon: 'image',
    mode: 'img',
  },
  properties: {
    name: 'Properties',
    extensions: ['.properties'],
    icon: 'file-earmark-code',
    mode: 'text/x-properties',
  },
  scenario: {
    name: 'Scenario',
    extensions: ['.md'],
    pathPattern: /scenarios\/.*\.md/,
    icon: 'markdown',
    mode: 'scenario',
    previewMode: 'markdown',
  },
  script: {
    name: 'Script',
    extensions: ['gradlew', 'gradlew.bat'],
    icon: 'terminal',
    mode: 'text/x-sh',
  },
  svg: {
    name: 'SVG Image',
    extensions: ['.svg'],
    icon: 'image',
    mode: 'text/xml',
    previewMode: 'img',
  },
  text: {
    name: 'Plain Text',
    extensions: ['.txt'],
    icon: 'file-earmark',
    mode: 'text/plain',
  },
  typescript: {
    name: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    icon: 'file-earmark-code',
    mode: 'text/typescript',
  },
  yaml: {
    name: 'YAML',
    extensions: ['.yaml', '.yml'],
    icon: 'file-earmark-code',
    mode: 'text/x-yaml',
  },
};
