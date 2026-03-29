import os
import json
import logging
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from scrapy.crawler import CrawlerProcess
from .spiders.booking_spider import BookingSpider
from .spiders.google_maps_spider import GoogleMapsSpider
from .normalization import Normalizer
from .deduplicator import DuplicateEngine
from .db import PostgreSQLClient

logger = logging.getLogger(__name__)

class NUPipeline:
    def __init__(self):
        self.db = PostgreSQLClient(os.getenv("DATABASE_URL"))
        self.normalizer = Normalizer()
        self.deduplicator = DuplicateEngine(self.db)

    def run_discovery(self, city: str, categories: List[str]):
        """Stage 1: Source Discovery via Scrapy & Playwright"""
        logger.info(f"Starting discovery for {city} categories: {categories}")
        
        process = CrawlerProcess(settings={
            "USER_AGENT": "NU Travel Bot 1.0",
            "LOG_LEVEL": "INFO"
        })
        
        for category in categories:
            process.crawl(BookingSpider, city=city, category=category)
            process.crawl(GoogleMapsSpider, city=city, category=category)
            
        process.start()
        logger.info("Discovery complete. Triggering ETL pipeline...")

    async def run_etl(self, batch_id: str):
        """Stages 2-5: Extraction, Normalization, Deduplication, Verification"""
        raw_results = self.db.get_raw_crawls(batch_id)
        
        for raw in raw_results:
            # Stage 3: Normalization
            normalized = self.normalizer.process(raw)
            
            # Stage 4: Deduplication Engine
            is_duplicate, master_id = await self.deduplicator.check(normalized)
            
            if is_duplicate:
                self.db.add_source_to_master(master_id, normalized)
                await self.deduplicator.merge_verification_scores(master_id)
            else:
                new_place = self.db.insert_new_place(normalized)
                
            self.db.mark_processed(raw['id'])
            
if __name__ == "__main__":
    pipeline = NUPipeline()
    pipeline.run_discovery(city="Addis Ababa", categories=["hoteles", "restaurants", "tours"])
