import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { News } from "./entities/news.entity";
import { CreateNewsDto, UpdateNewsDto } from "./dto/createnews.dto";



@Injectable()
export class NewsService{
    constructor(@InjectRepository(News) private newsRepository: Repository<News>){}

    async findAll(limit: number = 50): Promise<News[]>{
        // Optimizado: Agregar límite y orden para reducir memoria
        return this.newsRepository.find({
            take: limit,
            order: { id: 'DESC' } // Asumiendo que id es incremental
        })
    }

    async findById(id:string): Promise <News>{
        
        const news = await this.newsRepository.findOne({
            where: {id}
        });
        if(!news){
            throw new NotFoundException(`Noticias con el  id ${id}`)
        }
        return news;
    }

    async createNews(createNewsDto: CreateNewsDto): Promise<News>{
        try{
            const news = this.newsRepository.create({...createNewsDto});
            console.log('Noticia creada', news);
            return await this.newsRepository.save(news)
        }
        catch(error){
            console.error('Error al crear la noticia: ', error)
            throw new Error('No se pudo crear la noticia')
        }
    }

    async updateNews(id:string, updateNewsDto: UpdateNewsDto): Promise<News>{

        const news = await this.newsRepository.findOne({where:{id}})
        if(!news){
            throw new NotFoundException(`Noticias con el  id ${id}`)
        }
        Object.assign(news, updateNewsDto);
        return await this.newsRepository.save(news)

    }

    async deleteNews(id:string) :Promise<News>{
        const news = await this.newsRepository.findOne({where:{id}})
        if(!news){
            throw new NotFoundException(`Noticias con el  id ${id}`)
        }
        return await this.newsRepository.remove(news)
    }
}

