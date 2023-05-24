import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';

/* Here we have controllers to do the following through HTTP requests :

    1 - delete a dm
    2 - get a dm
    3 - some other stuff ...
*/
// @UseGuards(new JwtAuthGuard())
@Controller('dm')
export class DmController {

}
