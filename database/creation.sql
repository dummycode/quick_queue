CREATE TABLE Queue (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(256),
	`capacity` INT,
	`created_at` DATETIME(3) NOT NULL,
	`deleted_at` DATETIME(3),
	PRIMARY KEY (id)
);

CREATE TABLE Node (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(256),
	`queue_id` INT NOT NULL,
	`serviced_at` DATETIME(3),
	`created_at` DATETIME(3) NOT NULL,
	`deleted_at` DATETIME(3),
	PRIMARY KEY (id),
	FOREIGN KEY (queue_id) REFERENCES Queue(id) ON DELETE CASCADE
);

CREATE TABLE User (
	`id` INT NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(256) NOT NULL,
	`password` VARCHAR(256) NOT NULL,
	`email` VARCHAR(256),
	`created_at` DATETIME(3) NOT NULL,
	`deleted_at` DATETIME(3),
	PRIMARY KEY (id)
);
