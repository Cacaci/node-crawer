const Crawler = require('crawler');
const fs = require('fs');
const path = require('path');

const c = new Crawler({
  // 在每个请求处理完毕后将调用此回调函数
  callback: (error, res, done) => {
    if (error) throw(err)
    const $ = res.$;
    const results = [];
    // $ 默认为 Cheerio 解析器
    // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
    // console.log($("title").text().trim());
    var grids = $('.grid_view li');
    for (let g = 0; g < grids.length; g++) {
      const grid = $(grids[g]);
      const result = {};
      result.title = grid.find('.title').text();
      result.cover = grid.find('.pic img').attr('src');
      let desc = grid.find('.bd').text().trim();
      result.desc = desc.replace(/\ +/g, '').replace(/[\r\n]/g, '');
      result.rate = grid.find('.rating_num').text();
      results.push(result);
    }
    // 对每个url的数据拼接
    const origin = fs.readFileSync(getDir('data', 'json'));
    const _origin = origin.toString() ? JSON.parse(origin) : []; // Array Object
    const _final = _origin.concat(results);
    fs.writeFileSync(getDir('data', 'json'), JSON.stringify(_final));

    // fs.writeFile(getDir('data', 'json'), '', err => {
    //   if (err) throw(err)
    //   fs.appendFileSync(getDir('data', 'json'), JSON.stringify(results));
    // })

    done();
  }
});

const getDir = (file, suffix = 'html') => {
  return path.join(`${__dirname}/${file}.${suffix}`);
}

const getUrls = (end) => {
  // 先清空旧的内容再写入数据
  fs.writeFile(getDir('data', 'json'), '', err => {
    if (err) throw(err)
    let baseUrl = 'https://movie.douban.com/top250';
    c.queue([{
      uri: baseUrl,
      jQuery: true,
      callback: (error, res, done) => {
        let urls = [baseUrl];
        const $ = res.$;
        var pages = $('.paginator > a');
        for (let p = 0; p < pages.length; p++) {
          let page = pages[p]
          urls.push(`${baseUrl}${page.attribs.href}`)
        }
        c.queue(urls.slice(0, end));
        done();
      }
    }])
  });
}

getUrls(1);

// const getMove = (origin, page) => {
//   url: https://movie.douban.com/top250?start=25&filter=
// }

// 对单个URL使用特定的处理参数并指定单独的回调函数
// c.queue([{
//   uri: 'https://movie.douban.com/top250',
//   jQuery: true,

//   // The global callback won't be called
//   callback: (error, res, done) => {
//     const $ = res.$;
//     if (error) throw(error)

//     const text = $('#icp').text().trim();
//     fs.writeFile(getDir('origin'), res.body, err => { if (err) throw(err) });
//     fs.writeFile(getDir('douban'), text, err => {
//       if (err) throw(err)
//       // 抓取数据

//     })
//     done();
//   }
// }]);
