data <- read.table('centroid_locations.txt', sep = ' ', header = T, stringsAsFactors = F, check.names = F)
write.csv(data, file = 'centroid_locations.csv', row.names = F)
