import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { VideosService } from "./videos.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateVideoDto, UpdateVideoDto } from "./dto/createvideo.dto";

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
    constructor(private videosService: VideosService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a video' })
    @ApiResponse({ status: 201, description: 'Video created successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @UseGuards(AuthGuard)
    createVideo(@Body() createVideoDto: CreateVideoDto) {
      return this.videosService.createVideo(createVideoDto);
    }
    
    @Get()
    @ApiOperation({ summary: 'Get all videos' })
    @ApiResponse({ status: 200, description: 'Return all videos' })
    getVideos() {
        return this.videosService.findAll();
    }
    
    @Get(':id')
    @ApiOperation({ summary: 'Get a specific video' })
    @ApiResponse({ status: 200, description: 'Return the video' })
    @ApiResponse({ status: 404, description: 'Video not found' })
    getVideoById(@Param('id') id: string) {
        return this.videosService.findById(id);
    }
    
    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a video' })
    @ApiResponse({ status: 200, description: 'Video updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @UseGuards(AuthGuard)
    updateVideo(
        @Param('id') id: string,
        @Body() updateVideoDto: UpdateVideoDto,
    ) {
        return this.videosService.updateVideo(id, updateVideoDto);
    }
    
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a video' })
    @ApiResponse({ status: 200, description: 'Video deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @UseGuards(AuthGuard)
    deleteVideo(@Param('id') id: string) {
        return this.videosService.deleteVideo(id);
    }
} 