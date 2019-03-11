const APIKeys = require('./.APIKeys')
const fs = require('fs')
const merge = require('deepmerge')
const rp = require('request-promise')
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

url =
  'https://' + APIKeys.apikey + ':' + APIKeys.password + '@' + APIKeys.hostname

let JSONArray = []
let JSONOutput = 'src/data/includes/stock.json'
let OwltreeArray = []
let stockArray = []

let dressesPath = 'src/data/includes/products/dresses.json'
let mugsPath = 'src/data/includes/products/mugs.json'
let sweatshirtsPath = 'src/data/includes/products/sweatshirts.json'
let totebagsPath = 'src/data/includes/products/tote-bags.json'
let tshirtsPath = 'src/data/includes/products/t-shirts.json'

let dressesJSON = JSON.parse(fs.readFileSync(dressesPath, 'utf8'))
let mugsJSON = JSON.parse(fs.readFileSync(mugsPath, 'utf8'))
let sweatshirtsJSON = JSON.parse(fs.readFileSync(sweatshirtsPath, 'utf8'))
let totebagsJSON = JSON.parse(fs.readFileSync(totebagsPath, 'utf8'))
let tshirtsJSON = JSON.parse(fs.readFileSync(tshirtsPath, 'utf8'))

let options = {
  uri: url + '/admin/products/count.json',
  headers: {
    'User-Agent': 'Request-Promise'
  },
  json: true
}

function makeTitle (slug) {
  var words = slug.split('-')

  for (var i = 0; i < words.length; i++) {
    var word = words[i]
    words[i] = word.charAt(0).toUpperCase() + word.slice(1)
  }

  return words.join(' ')
}

rp(options)
  .then(function (response) {
    console.log('Getting stock ...')
    let pages = Math.ceil(response.count / 250)
    for (let i = 1; i < pages + 1; i++) {
      options.uri =
        url + '/admin/products.json?limit=250&page=' + i + '&fields=vendor,id'
      JSONArray.push(rp(options))
    }
    Promise.all(JSONArray)
      .then(function (response) {
        let JSONMerge = merge.all(response)
        for (let i = 0; i < JSONMerge.products.length; i++) {
          if (JSONMerge.products[i].vendor === 'Owltree') {
            options.uri =
              url + '/admin/products/' + JSONMerge.products[i].id + '.json'
            OwltreeArray.push(rp(options))
          }
        }
        Promise.all(OwltreeArray)
          .then(function (response) {
            for (let i = 0; i < response.length; i++) {
              let parentId = response[i].product.tags
              if (parentId.includes('vestido')) {
                parentId = 'dresses'
              }
              if (parentId.includes('camiseta')) {
                parentId = 't-shirts'
              }
              if (parentId.includes('sudadera')) {
                parentId = 'sweatshirts'
              }
              if (parentId.includes('taza')) {
                parentId = 'mugs'
              }
              if (parentId.includes('bolsa') || parentId.includes('totebag')) {
                parentId = 'tote-bags'
              }
              let id = response[i].product.handle.match(/(?<=apparel-)(.*)/)[0]
              // if (id === 'animals-have-feelings') {
              //   id = 'feelings'
              // }
              // if (id === 'dont-use-animals') {
              //   id = 'dont-use'
              // }
              // if (id === 'meat-is-death') {
              //   id = 'death'
              // }
              // if (id === 'tofu-killers') {
              //   id = 'tofu'
              // }
              // if (id === 'save-the-animals') {
              //   id = 'save-animals'
              // }
              // if (id === 'too-late') {
              //   id = 'never-too-late'
              // }
              let gender = response[i].product.product_type
              if (gender === 'Hombre, mujer') {
                gender = 'unisex'
              } else if (gender === 'Mujer') {
                gender = 'women'
              }
              if (parentId === 'mugs' || parentId === 'tote-bags') {
                gender = ''
              }
              let product = {}
              product['parentId'] = parentId
              product['id'] = id
              product['model'] = makeTitle(id)
              product['link'] =
                'https://amapolaveganshop.com/products/' +
                response[i].product.handle
              product['gender'] = gender
              product['sizes'] = []
              product['quantity'] = null
              let variants = response[i].product.variants
              let stockCounter = 0
              for (let i = 0; i < variants.length; i++) {
                let price = variants[i].price
                let size = variants[i].title
                let stock = variants[i].inventory_quantity
                let variant = {}
                product['price'] = price
                if (size !== 'Default Title') {
                  variant['size'] = size
                  variant['stock'] = stock
                  if (stock < 1) {
                    variant['stockStatus'] = 'out of stock'
                  } else {
                    variant['stockStatus'] = 'in stock'
                    stockCounter++
                  }
                  product.sizes.push(variant)
                } else {
                  product['sizes'] = null
                  product['quantity'] = stock
                  if (stock < 1) {
                    product['stockStatus'] = 'out of stock'
                  } else {
                    product['stockStatus'] = 'in stock'
                    stockCounter++
                  }
                }
                if (stockCounter < 1) {
                  product['stockGlobal'] = 'out of stock'
                } else {
                  product['stockGlobal'] = 'in stock'
                }
              }
              stockArray.push(product)

              if (parentId == 'dresses') {
                for (let i = 0; i < dressesJSON.children.length; i++) {
                  let el = dressesJSON.children[i]
                  if (el.id == product.id) {
                    dressesJSON.children[i] = merge(el, product, {
                      arrayMerge: overwriteMerge
                    })
                  }
                }
              }
              if (parentId == 'mugs') {
                for (let i = 0; i < mugsJSON.children.length; i++) {
                  let el = mugsJSON.children[i]
                  if (el.id == product.id) {
                    mugsJSON.children[i] = merge(el, product, {
                      arrayMerge: overwriteMerge
                    })
                  }
                }
              }
              if (parentId == 'sweatshirts') {
                for (let i = 0; i < sweatshirtsJSON.children.length; i++) {
                  let el = sweatshirtsJSON.children[i]
                  if (el.id == product.id) {
                    sweatshirtsJSON.children[i] = merge(el, product, {
                      arrayMerge: overwriteMerge
                    })
                  }
                }
              }
              if (parentId == 'tote-bags') {
                for (let i = 0; i < totebagsJSON.children.length; i++) {
                  let el = totebagsJSON.children[i]
                  if (el.id == product.id) {
                    totebagsJSON.children[i] = merge(el, product, {
                      arrayMerge: overwriteMerge
                    })
                  }
                }
              }
              if (parentId == 't-shirts') {
                for (let i = 0; i < tshirtsJSON.children.length; i++) {
                  let el = tshirtsJSON.children[i]
                  if (el.id == product.id) {
                    tshirtsJSON.children[i] = merge(el, product, {
                      arrayMerge: overwriteMerge
                    })
                  }
                }
              }
            }
            fs.writeFile(
              dressesPath,
              JSON.stringify(dressesJSON, null, 2),
              function (err) {
                if (err) {
                  console.log(err)
                } else {
                  console.log('\nJSON saved to "' + dressesPath + '"')
                }
              }
            )
            fs.writeFile(mugsPath, JSON.stringify(mugsJSON, null, 2), function (
              err
            ) {
              if (err) {
                console.log(err)
              } else {
                console.log('\nJSON saved to "' + mugsPath + '"')
              }
            })
            fs.writeFile(
              sweatshirtsPath,
              JSON.stringify(sweatshirtsJSON, null, 2),
              function (err) {
                if (err) {
                  console.log(err)
                } else {
                  console.log('\nJSON saved to "' + sweatshirtsPath + '"')
                }
              }
            )
            fs.writeFile(
              totebagsPath,
              JSON.stringify(totebagsJSON, null, 2),
              function (err) {
                if (err) {
                  console.log(err)
                } else {
                  console.log('\nJSON saved to "' + totebagsPath + '"')
                }
              }
            )
            fs.writeFile(
              tshirtsPath,
              JSON.stringify(tshirtsJSON, null, 2),
              function (err) {
                if (err) {
                  console.log(err)
                } else {
                  console.log('\nJSON saved to "' + tshirtsPath + '"')
                }
              }
            )
            console.log('Stock received successfully!')
            fs.writeFile(
              JSONOutput,
              JSON.stringify(stockArray, null, 2),
              function (err) {
                if (err) {
                  console.log(err)
                } else {
                  console.log('\nJSON saved to "' + JSONOutput + '"')
                }
              }
            )
          })
          .catch(function (err) {
            console.log(err)
          })
      })
      .catch(function (err) {
        console.log(err)
      })
  })
  .catch(function (err) {
    console.log(err)
  })
