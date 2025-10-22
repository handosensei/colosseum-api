-- data to test
INSERT INTO `character` (`id`,`name`, `createdAt`, `updatedAt`, `ownerId`)
VALUES
    (UUID(),'Aldric the Brave', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Lyra the Swift', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Kael Ironfist', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Seraphina Dawnblade', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Thorin the Silent', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Elandra the Wise', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Draven Shadowborn', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Nyssa Stormheart', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Orin the Wanderer', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec'),
    (UUID(),'Mira the Flamecaller', NOW(), NOW(), 'b5666bfb-ccd1-4e49-9306-f5abf5e10cec');