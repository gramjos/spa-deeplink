### Convert an Obsidian Note-taking vault into valid HTML by following directory structuring and parsing rules.
Given a directory, traverse the file structure and convert valid markdown files to HTML. A valid directory/file means it will be converted to HTML.
### Obsidian Directory Structuring Rules
##### 1. Structure rule: **The README signal**. The existence of `README.md` file makes the directory's files valid to convert. This only covert files that have a README in the same directory and only convert directories that contain a README.
##### 2. Structure rule: __The graphics directory exception__.  Directories exactly named "graphics" are exempt from having a `README`. These graphics directories contain supporting media. 
### User Interface
There are two general type pages with be created: 1) File Content. 2) README (home page) Content.
1.) File Content: (see attached image file  [[file_content_wire_frame.png]]). This page is mainly Parsed markdown
2.) README (home page) (see attached image file [[README_homepage_wire_frame.png]]).  `README.md` acts as the directory _Home Page_ for all the other content in the directory. README content contains: parsed markdown from the README itself, link(s) to the other possible directory home pages and/or other files. 
For example purposes, here is the entirety of my notes. 
```shell
$ tree my_obsidian_vault
.
├── about.md
├── graphics
│   └── img1.png
├── home.md
├── physics
│   ├── golden_file.md
│   └── README.md
├── nature
│   ├── tundra
│   │   ├── README.md
│   │   └── arctic.md
│   ├── README.md
│   └── desert.md
├── poetry
│   ├── poet
│   │   ├── README.md
│   │   └── scared to show this.md
│   └── showtime.md
└── README.md
```
#### All directories with their own `README.md` acts as that directories' _Home Page_
In the example above, the top level landing page from the directory structure would yield:
- the content in the `README.md` 
- a link to the web pages `home` and `about`
- a link to the web landing page of `physics`
- Nature
- NOT a link to `poetry` because no `README.md` (Even though, a README in directory `poet` there needs to be a README in `poetry` directory to see `showtime.md` and directory `poet`)
For a visual of how the above directory is represented, see the attached image [[connection_graph.png]] that show the connections between the File Content and the README (home page). 
#### The Creation of Web Pages from Parsing Rules
Markdown files are converted to HTML chunks using a minimal parser and written next to the originals.
Output is a directory called `try_hosting_Vault_ready_2_serve`
```shell
$ tree try_hosting_Vault_ready_2_serve 
try_hosting_Vault_ready_2_serve
├── about.html
├── about.md
├── graphics
│   └── img1.png
├── homie.html
├── homie.md
├── physics
│   ├── golden_file.html
│   ├── golden_file.md
│   ├── README.html
│   └── README.md
├── nature
│   ├── tundra
│   │   ├── README.md
│   │   ├── README.html
│   │   ├── arctic.html
│   │   └── arctic.md
│   ├── README.md
│   ├── README.html
│   ├── desert.html
│   └── desert.md
├── README.html
└── README.md
```
## Supported Tags
1. Heading
2. Paragraph
3. Bold, 'Code' and Italic text
4. Media (static images and GIFs)
5. Links (external web links and intra-file links (wiki-style))
### Usage
##### Run the markdown to html parser by pointing it at the root of your vault:
```shell
$ python build.py /Users/gramjos/Documents/try_hosting_Vault
```