const APIKeys = require('./.APIKeys')
const fs = require('fs')
const merge = require('deepmerge')
const rp = require('request-promise')
const url =
  'https://' + APIKeys.apikey + ':' + APIKeys.password + '@' + APIKeys.hostname

let JSONArray = []
let JSONOutput = 'src/data/includes/stock.json'
let OwltreeArray = []
let stockArray = []

let baseDressesPath = 'src/data/includes/products/base/dresses.json'
let baseMugsPath = 'src/data/includes/products/base/mugs.json'
let baseSweatshirtsPath = 'src/data/includes/products/base/sweatshirts.json'
let baseTotebagsPath = 'src/data/includes/products/base/tote-bags.json'
let baseTshirtsPath = 'src/data/includes/products/base/t-shirts.json'

let baseDressesJSON = JSON.parse(fs.readFileSync(baseDressesPath, 'utf8'))
let baseMugsJSON = JSON.parse(fs.readFileSync(baseMugsPath, 'utf8'))
let baseSweatshirtsJSON = JSON.parse(fs.readFileSync(baseSweatshirtsPath, 'utf8'))
let baseTotebagsJSON = JSON.parse(fs.readFileSync(baseTotebagsPath, 'utf8'))
let baseTshirtsJSON = JSON.parse(fs.readFileSync(baseTshirtsPath, 'utf8'))

let finalDressesPath = 'src/data/includes/products/dresses.json'
let finalMugsPath = 'src/data/includes/products/mugs.json'
let finalSweatshirtsPath = 'src/data/includes/products/sweatshirts.json'
let finalTotebagsPath = 'src/data/includes/products/tote-bags.json'
let finalTshirtsPath = 'src/data/includes/products/t-shirts.json'

let options = {
  uri: url + '/admin/products/count.json',
  headers: {
    'User-Agent': 'Request-Promise'
  },
  json: true
}

function createJSON (src, dest) {
  fs.writeFile(dest, JSON.stringify(src, null, 2), function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log('\nJSON saved to "' + dest + '"')
    }
  })
}

function appendJSON (parentJSON, grandParentJSON) {
  let baseJSON = parentJSON
  let childrenArray = []
  for (let j = 0; j < baseJSON.children.length; j++) {
    let child = baseJSON.children[j]
    if (child.id === grandParentJSON.id) {
      if (child.gender === grandParentJSON.gender) {
        Object.keys(grandParentJSON).forEach(function (k) {
          child[k] = grandParentJSON[k]
        })
      }
    }
    childrenArray.push(child)
  }
  baseJSON.children = childrenArray

  return baseJSON
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

              // Sort keys alphabetically
              var sortedProduct = Object.keys(product)
                .sort()
                .reduce(function (result, key) {
                  return Object.assign({}, result, {
                    [key]: product[key]
                  })
                }, {})

              stockArray.push(sortedProduct)
            }
            console.log('Stock received successfully!')
            fs.writeFile(
              JSONOutput,
              JSON.stringify(stockArray, null, 2),
              function (err) {
                if (err) {
                  console.log(err)
                } else {
                  console.log('\nJSON saved to "' + JSONOutput + '"')
                  for (let i = 0; i < stockArray.length; i++) {
                    switch (stockArray[i].parentId) {
                      case 'dresses':
                        var finalDressesJSON = appendJSON(
                          baseDressesJSON,
                          stockArray[i]
                        )
                        break
                      case 'mugs':
                        var finalMugsJSON = appendJSON(
                          baseMugsJSON,
                          stockArray[i]
                        )
                        break
                      case 'sweatshirts':
                        var finalSweatshirtsJSON = appendJSON(
                          baseSweatshirtsJSON,
                          stockArray[i]
                        )
                        break
                      case 't-shirts':
                        var finalTshirtsJSON = appendJSON(
                          baseTshirtsJSON,
                          stockArray[i]
                        )
                        break
                      case 'tote-bags':
                        var finalTotebagsJSON = appendJSON(
                          baseTotebagsJSON,
                          stockArray[i]
                        )
                        break
                    }
                  }
                  createJSON(finalDressesJSON, finalDressesPath)
                  createJSON(finalMugsJSON, finalMugsPath)
                  createJSON(finalSweatshirtsJSON, finalSweatshirtsPath)
                  createJSON(finalTshirtsJSON, finalTshirtsPath)
                  createJSON(finalTotebagsJSON, finalTotebagsPath)
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
