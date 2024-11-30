import { GATEWAY_ERROR_MESSAGE } from '@app/constants/error.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ErrorMessageService {
    @Inject() private logger: Logger;

    gatewayError(gateway: Gateway, event: string, error: Error) {
        this.logger.error('[' + gateway + '] ' + GATEWAY_ERROR_MESSAGE + event);
        this.logger.log(error);
    }

    aiError(error: Error) {
        this.logger.error('[VP] Error in the virtual player turn action');
        this.logger.log(error);
    }
}
