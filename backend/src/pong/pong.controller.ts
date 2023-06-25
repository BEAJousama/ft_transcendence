import { PongService } from './pong.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('pong')
export class PongController {
    constructor(private pongService: PongService) {}
    
    @Get('live-games')
    async getLiveGames() {
        try {
            return await this.pongService.getLiveGames();
        } catch (error) {
            throw error
        }
    }

//    @Get('live-games/:id')
//     async getLiveGame(@Param('id') id: string) {
//         try {
//             return await this.pongService.getLiveGame(id);
//         } catch (error) {
//             throw error
//         }
//     }

    @Get('match-history/:id')
    async getMatchHistory(@Param('id') id: string) {
        try {
            return await this.pongService.getMatchHistory(parseInt(id));
        } catch (error) {
            throw error
        }
    }


}

