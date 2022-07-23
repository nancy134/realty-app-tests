const { Builder, By, Key, until } = require('selenium-webdriver')
const assert = require('assert')
require('dotenv').config();

async function Login(driver){
    await driver.findElement(By.id("login-email-input")).sendKeys(process.env.USER_EMAIL)
    await driver.findElement(By.id("login-password-input")).sendKeys(process.env.USER_PASSWORD)
    await driver.findElement(By.id("login-button")).click()
}

async function LoginFromButton(driver){
    await driver.findElement(By.id("account-button")).click()
	await Login(driver);
}

async function AddListing(driver, signedIn){
    await driver.findElement(By.id("button-add-listing")).click()
	
    await driver.findElement(By.id("button-add-listing-type-next")).click()
	
	var typeAhead = Math.floor(Math.random() * 99);
	var typeAheadStr = typeAhead.toString()
	var shortDescription = typeAheadStr + " automated test"
    await driver.findElement(By.id("input-add-listing-address")).sendKeys(typeAheadStr)
	
    let suggestion = await driver.wait(until.elementLocated(By.className('suggestion-item')), 10000);
    var suggestionText = await suggestion.getAttribute("innerText");
    await suggestion.click();
	
	await driver.wait(until.elementLocated(By.id('add_address_next_button')), 10000);
	let addAddressNextButton = driver.findElement(By.id('add_address_next_button'))
	await driver.wait(until.elementIsEnabled(addAddressNextButton), 10000);
	
    await driver.findElement(By.id("add_address_next_button")).click()
    await driver.findElement(By.id("overview_edit_short_description_input")).sendKeys("24 automated test")
	await driver.findElement(By.id("overview_create_listing_button")).click()
	
	if (!signedIn) await Login(driver)
	await driver.wait(until.elementLocated(By.id('overview_edit_next_button')), 10000);
    await driver.findElement(By.id("overview_edit_next_button")).click()

	await driver.wait(until.elementLocated(By.id('header_close_detail')), 10000);

}

async function SearchCity(driver){
    await driver.findElement(By.id("toolbar-input-address")).click()
    await driver.findElement(By.id("toolbar-input-address")).sendKeys("Boston, MA")
    let suggestion = await driver.wait(until.elementLocated(By.className('suggestion-item')), 10000);
    var suggestionText = await suggestion.getAttribute("innerText");
    await suggestion.click();
    await driver.findElement(By.className("toolbar-search-button")).click()
}

async function VerifyLogin(driver){
	let accountDropdown = await driver.wait(until.elementLocated(By.id('account-button-dropdown')), 10000);
	let buttonText = await accountDropdown.getText();
	assert.strictEqual(buttonText, "Nancy Yahoo (SU)");
}

async function VerifyMyListings(driver){
	let myListingTab = await driver.wait(until.elementLocated(By.id('listing-tabs-tab-myListings')), 10000);
	let className = await myListingTab.getAttribute("class")
	assert.strictEqual(className, "nav-link active");
}

async function VerifyListingDetailEdit(driver){
	let editTab = await driver.wait(until.elementLocated(By.id('listing-detail-toolbar-tab-edit')), 10000);
	let className = await editTab.getAttribute("class")
	assert.strictEqual(className, "nav-link active");
}
async function PublishListing(driver){
    await driver.findElement(By.id("button-detail-toolbar-transition")).click()
}
describe('FindingCRE Testing Suite', function() {
  this.timeout(30000)
  let driver
  let vars
  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build()
    vars = {}
  })
  afterEach(async function() {
    //await driver.quit();
  })
  it('Login from Home', async function() {
    await driver.get("https://local.phowma.com/home")
    await driver.manage().window().maximize()
	await LoginFromButton(driver)
	await VerifyLogin(driver)
  })
  
  it('Add Listing from Home, not signed in', async function() {
    await driver.get("https://local.phowma.com/home")
    await driver.manage().window().maximize()
	await AddListing(driver, false)
	await VerifyLogin(driver)
	await VerifyMyListings(driver)
	await VerifyListingDetailEdit(driver)
  })

  it('Add Listing from Home, signed in', async function() {
    await driver.get("https://local.phowma.com/home")
    await driver.manage().window().maximize()
	await LoginFromButton(driver)
	await AddListing(driver, true)
	await VerifyLogin(driver)
	await VerifyMyListings(driver)
	await VerifyListingDetailEdit(driver)
  })
  
  it('Search city', async function() {
    await driver.get("https://local.phowma.com/home")
    await driver.manage().window().maximize()
	await SearchCity(driver)
  })

  it('Add Listing from Listing Page, not signed in', async function() {
    await driver.get("https://local.phowma.com/listing")
    await driver.manage().window().maximize()
	await AddListing(driver, false)
	await VerifyLogin(driver)
	await VerifyMyListings(driver)
	await VerifyListingDetailEdit(driver)
  })

  it('Login from Listing Page', async function() {
    await driver.get("https://local.phowma.com/listing")
    await driver.manage().window().maximize()
	await LoginFromButton(driver)
	await VerifyLogin(driver)
  })

  it('Publish Listing', async function() {
    await driver.get("https://local.phowma.com/home")
    await driver.manage().window().maximize()
	await AddListing(driver, false)
	await PublishListing(driver)
  })
  
})
