import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'node:fs/promises';
import * as qr from 'qrcode';
import * as _ from 'lodash';
import { url } from 'inspector';
import { PrismaService } from 'src/prisma/prisma.service';
import { Movie, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

let moviesPath = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'utils',
  'movies.json',
);
type fetchedMovies = Array<{
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  Response: string;
  Images: string[];
}>;
type movies = Array<{
  Title: string;
  Poster: string;
  //   Images: string[];
  Image: string;
}>;

@Injectable()
export class CodeService {
  constructor(
    private prismaService: PrismaService,
    private config: ConfigService,
  ) {}

  async generateQrCode() {
    let moviesObj: { movies: [] };
    let movies: movies = [];
    moviesObj = JSON.parse(await fs.readFile(moviesPath, 'utf8'));
    let fetchedMovies: fetchedMovies = moviesObj?.movies;

    for (const movie of fetchedMovies) {
      movies.push({
        Title: movie?.Title,
        Poster: movie?.Poster,
        Image: movie?.Images[0],
      });
    }

    // using lodash to shuffle/randomly sort movies
    const tenShuffledMovies: movies = _.shuffle(movies).slice(0, 10);

    // persist record to db
    const record = await this.prismaService.movie.create({
      data: { movies: tenShuffledMovies },
    });

    const link = `${this.config.get('FRONTEND_URL')}scan/${record.id}`;
    try {
      let res = await qr.toDataURL(link);
      return { data: res };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async scanQrCode(id: number) {
    const record: Movie = await this.prismaService.movie.findFirst({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException('Movies not found');
    }
    const parsedMovies = record?.movies as Prisma.JsonArray;

    return { movies: parsedMovies };
  }
}
