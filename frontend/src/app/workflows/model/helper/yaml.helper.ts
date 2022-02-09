import Ajv from 'ajv';
import * as Yaml from 'js-yaml';

export class YamlHelper {
  private ajv!: Ajv;
  private yamlContent!: string;
  private readonly validate!: any;

  constructor(ajv: Ajv,
              validate: any) {
    this.ajv = ajv;
    this.validate = validate;
  }

  public lintYamlString(yamlContent: string): boolean {
    this.yamlContent = yamlContent;

    const yaml = Yaml.load(this.yamlContent);

    return this.validate(yaml);
  }
}
