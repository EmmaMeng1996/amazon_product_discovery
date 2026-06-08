CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asin` varchar(20) NOT NULL,
	`title` text NOT NULL,
	`category` varchar(255),
	`price` decimal(10,2),
	`rating` decimal(3,1),
	`reviewCount` int DEFAULT 0,
	`sellerCount` int DEFAULT 0,
	`weight` decimal(8,3),
	`dimensions` varchar(255),
	`productUrl` text,
	`keyword` varchar(255),
	`passedHardFilter` int DEFAULT 0,
	`filterReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_asin_unique` UNIQUE(`asin`)
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asin` varchar(20) NOT NULL,
	`competitionScore` decimal(5,2) DEFAULT '0',
	`profitScore` decimal(5,2) DEFAULT '0',
	`differentiationScore` decimal(5,2) DEFAULT '0',
	`developmentScore` decimal(5,2) DEFAULT '0',
	`totalScore` decimal(5,2) DEFAULT '0',
	`grade` enum('A','B','C','D') NOT NULL,
	`recommendReason` text,
	`riskReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `scores_asin_unique` UNIQUE(`asin`)
);
--> statement-breakpoint
CREATE TABLE `scoringRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`minPrice` decimal(10,2) DEFAULT '20',
	`maxPrice` decimal(10,2) DEFAULT '80',
	`minReviewCount` int DEFAULT 50,
	`maxReviewCount` int DEFAULT 800,
	`maxWeight` decimal(8,3) DEFAULT '1',
	`competitionWeight` decimal(5,2) DEFAULT '25',
	`profitWeight` decimal(5,2) DEFAULT '25',
	`differentiationWeight` decimal(5,2) DEFAULT '30',
	`developmentWeight` decimal(5,2) DEFAULT '20',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scoringRules_id` PRIMARY KEY(`id`)
);
