import { JsonSchema7, UISchemaElement } from '@jsonforms/core';
import { MetaDataDto } from './meta-data.dto';

export interface ServerStateDto {
  meta: MetaDataDto;
  entities: any;
  entitySchema: JsonSchema7;
  uiSchema: UISchemaElement;
}