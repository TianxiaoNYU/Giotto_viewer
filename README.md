# Giotto_viewer
The viewer part of Giotto, scRNA-seq analyze/visualize program

## How to use
There is already an well-built example in this repo, which you can use by command lines:
```shell
python3 read_config.py -c my_setup.json -o test.js -p test.html -q test.css
python3 -m http.server
```
Then you can visualize the html file by 
```
http://localhost:8000/test.html
```
