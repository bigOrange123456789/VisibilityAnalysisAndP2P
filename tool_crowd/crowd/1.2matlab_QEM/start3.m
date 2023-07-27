clc
addpath('src');
addpath('lib/jsonlab-master');

avatarGroup=Group("manA20.json");
avatarGroup.simplify(0.5);
avatarGroup.path="test3.json";
avatarGroup.download();