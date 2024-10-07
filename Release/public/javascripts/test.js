let color_dictionary = {
  "Clothes": [
    250,
    227,
    205
  ],
  "Eye": [
    253,
    231,
    208
  ],
  "Face": [
    234,
    203,
    175
  ],
  "Hair": [
    128,
    96,
    103
  ],
  "Pants": [
    26,
    29,
    34
  ],
  "Shoes": [
    86,
    74,
    94
  ]
};

for (let segment_part in color_dictionary){
    console.log(`segement part: ${segment_part}`);
    console.log(`colorTuple: ${color_dictionary[segment_part]}`);
    console.log(`colorTuple[0]: ${color_dictionary[segment_part][0]}`);
    console.log(`colorTuple[0]: ${color_dictionary[segment_part][1]}`);
    console.log(`colorTuple[0]: ${color_dictionary[segment_part][2]}`);
};

if (color_dictionary){
    for (let segment_part in color_dictionary){
        console.log(`segement part: ${segment_part}`);

        let colorTuple = color_dictionary[segment_part];
        let rgbColor = `rgb(${colorTuple[0]}, ${colorTuple[1]}, ${colorTuple[2]})`;

        console.log(`${rgbColor}`);
    }
};