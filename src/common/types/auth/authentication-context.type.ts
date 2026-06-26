import { Environment } from '../../enums/api-credentials.enums';


export interface AuthenticationContext {
  merchantId: string;
  environment: Environment;
  apiCredentialId: string;
}