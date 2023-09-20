DROP DATABASE IF EXISTS `scql`;
CREATE DATABASE `scql`; 
USE `scql`;

SET NAMES utf8 ;
SET character_set_client = utf8mb4 ;

CREATE TABLE `userinfo` (
  `account` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`account`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
