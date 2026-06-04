import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { SearchService } from "./search.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("search")
export class SearchController {
  constructor(private svc: SearchService) {}

  @Get()
  search(@Query("q") q: string) {
    if (!q || q.length < 2) return [];
    return this.svc.globalSearch(q);
  }
}
