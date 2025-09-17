import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { CommonService } from './common.service';

@Controller()
export class CommonController {

    private currentObjectName: string;

    constructor(private readonly commonService: CommonService) {
        this.currentObjectName = 'Common';
    }



    @Get('search-bar')
    async getSearchBarProducts(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
        try {
            const results = await this.commonService.getSearchBarResults(page, limit, search);
            return {
                status: 'success',
                message: 'Search results retrieved successfully',
                data: results
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

     @Post('searchpage')
    async getSearchPageProducts(@Body() body: { 
        query?: string; 
        brands?: string[]; 
        categories?: string[]; 
        price?: { min: number; max: number }; 
        sort?: string; 
        page?: number; 
        limit?: number; 
    }) {
        try {
            const results = await this.commonService.getSearchPageResults(body);
            return {
                status: 'success',
                message: 'Search results retrieved successfully',
                data: results
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

    @Get('filters')
    async getFilters() {
        try {
            const results = await this.commonService.getFilters();
            return {
                status: 'success',
                message: 'Filters retrieved successfully',
                data: results
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

}