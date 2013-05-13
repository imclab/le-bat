-- Generation Time: May 13, 2013 at 09:29 PM

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE IF NOT EXISTS `profile` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `name` varchar(60) NOT NULL,
  `created` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `sequence`
--

CREATE TABLE IF NOT EXISTS `sequence` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content` varchar(60) NOT NULL,
  `last_update` bigint(20) unsigned NOT NULL,
  `total_count` bigint(20) unsigned NOT NULL,
  `blocked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `content` (`content`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Character sequences to look out for in tweets.' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `sequence_sound`
--

CREATE TABLE IF NOT EXISTS `sequence_sound` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sequence_id` int(10) unsigned NOT NULL,
  `sound_id` int(10) unsigned NOT NULL,
  `profile_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sequence_id` (`sequence_id`),
  KEY `profile_id` (`profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Associates character sequences with sounds.' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `sound`
--

CREATE TABLE IF NOT EXISTS `sound` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `name` varchar(60) NOT NULL,
  `sha1` varchar(40) CHARACTER SET ascii NOT NULL COMMENT 'hex digest',
  `file_path` text NOT NULL,
  `source` text NOT NULL,
  `license` varchar(32) NOT NULL,
  `author` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sha1` (`sha1`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Audio file entities to be used for playback.' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE IF NOT EXISTS `tag` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Tags to be put on other entities.' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `tag_sound`
--

CREATE TABLE IF NOT EXISTS `tag_sound` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tag_id` int(10) unsigned NOT NULL,
  `sound_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Associates tags with sounds' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `pass` char(128) CHARACTER SET ascii NOT NULL COMMENT 'sha512',
  `salt` bigint(20) unsigned NOT NULL,
  `gender` tinyint(3) unsigned NOT NULL COMMENT 'enums are bad',
  `age` tinyint(3) unsigned NOT NULL,
  `created` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `var`
--

CREATE TABLE IF NOT EXISTS `var` (
  `name` varchar(32) NOT NULL,
  `value` text NOT NULL,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
