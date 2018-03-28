/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `ouick_two`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `datasets`
--

CREATE TABLE `datasets` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `fields`
--

CREATE TABLE `fields` (
  `id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `type` varchar(255) COLLATE utf8_bin NOT NULL,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `default_value` text COLLATE utf8_bin NOT NULL,
  `additional` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `field_types`
--

CREATE TABLE `field_types` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `syntax` text COLLATE utf8_bin NOT NULL,
  `info_text` text COLLATE utf8_bin NOT NULL,
  `order_id` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `field_types`
--

INSERT INTO `field_types` (`id`, `title`, `syntax`, `info_text`, `order_id`, `active`) VALUES
(1, 'int', '<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"int\"  %ngm%>', 'zB 1,2,3,4 usw.', 1, 1),
(2, 'float', '<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"float\"  %ngm%>', 'zb 7,5 oder 1,1415\r\n', 2, 1),
(3, 'text', '<input type=\"text\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"text\" %ngm%>', '', 3, 1),
(4, 'id', '<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%next_auto_index%\" class=\"int\"  %ngm% disabled>', '', 0, 1),
(5, 'date', '<input type=\"datetime-local\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"datetime\" %ngm%>', '', 5, 1),
(6, 'file', '<input type=\"file\" change=\"fileChange($event)\" placeholder=\"Upload file\" accept=\".pdf,.doc,.docx\">', '', 6, 1),
(7, 'image', '<input type=\"file\" (change)=\"fileChange($event)\" placeholder=\"Upload file\" accept=\".pdf,.doc,.docx\">', 'jpgeg/png/gif', 7, 0),
(8, 'dropdown', '<select name=\"%field_id%\" id=\"%field_id%\" %ngm%>%dropdown_values%</select>', '', 8, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `field_values`
--

CREATE TABLE `field_values` (
  `field_id` int(11) NOT NULL,
  `row` int(11) NOT NULL,
  `value` text COLLATE utf8_bin NOT NULL,
  `timestamp` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `forms`
--

CREATE TABLE `forms` (
  `id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `title` text COLLATE utf8_bin NOT NULL,
  `json` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tables`
--

CREATE TABLE `tables` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `dataset_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `datasets`
--
ALTER TABLE `datasets`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `fields`
--
ALTER TABLE `fields`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `field_types`
--
ALTER TABLE `field_types`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `field_values`
--
ALTER TABLE `field_values`
  ADD UNIQUE KEY `field_id` (`field_id`,`row`,`timestamp`);

--
-- Indizes für die Tabelle `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `table_id` (`table_id`);

--
-- Indizes für die Tabelle `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `datasets`
--
ALTER TABLE `datasets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `fields`
--
ALTER TABLE `fields`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `field_types`
--
ALTER TABLE `field_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT für Tabelle `forms`
--
ALTER TABLE `forms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `tables`
--
ALTER TABLE `tables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
