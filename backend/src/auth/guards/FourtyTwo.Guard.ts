import { AuthGuard } from '@nestjs/passport';

export class FourtyTwoGuard extends AuthGuard('42') {}
