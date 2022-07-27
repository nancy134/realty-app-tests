const { Builder, By, Key, until } = require('selenium-webdriver')
const assert = require('assert')
require('dotenv').config();
require('chromedriver');

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
	
	await driver.wait(until.elementLocated(By.id('wizard-publish-checkbox-terms')), 10000);
    await driver.findElement(By.id("wizard-publish-checkbox-terms")).click()

	await driver.wait(until.elementLocated(By.id('wizard-publish-intro-next')), 10000);
	let nextButton = driver.findElement(By.id('wizard-publish-intro-next'))
	await driver.wait(until.elementIsEnabled(nextButton), 10000);
    await driver.findElement(By.id("wizard-publish-intro-next")).click()

	await driver.wait(until.elementLocated(By.id('wizard-publish-payment-method-next')), 10000);
	nextButton = driver.findElement(By.id('wizard-publish-payment-method-next'))
	await driver.wait(until.elementIsEnabled(nextButton), 10000);
    await driver.findElement(By.id("wizard-publish-payment-method-next")).click()	

	await driver.wait(until.elementLocated(By.id('wizard-publish-finish')), 10000);
	nextButton = driver.findElement(By.id('wizard-publish-finish'))
	await driver.wait(until.elementIsEnabled(nextButton), 10000);
    await driver.findElement(By.id("wizard-publish-finish")).click()	
}

async function AddAvailableSpace(driver){

	// Get height of window
    let windowInnerHeight = await driver.executeScript("return window.innerHeight;");

    // Scroll to Available Space Add Button
	await driver.wait(until.elementLocated(By.id('span_space_add_button')), 10000);
	let element = await driver.findElement(By.id('span_space_add_button'));
	let offsetTop = await element.getAttribute("offsetTop");
	let scrollDistance = parseInt(offsetTop) + 80 - parseInt(windowInnerHeight);
    let scrollStr = "document.getElementById('leftcol-listing-detail').scrollBy(0,"+scrollDistance+")";
    await driver.executeScript(scrollStr);
	
	// Launch Available Space edit button
    await driver.findElement(By.id('span_space_add_button')).click()
	
	// Select Space Use
	await driver.wait(until.elementLocated(By.id('space_edit_use')),10000);
	let spaceUse = driver.findElement(By.id('space_edit_use'));
	spaceUse.sendKeys("Retail");

    // Enter Size
    await driver.findElement(By.id("space_edit_size")).sendKeys("1000")

    // Save
    await driver.findElement(By.id("space_button_save")).click()
}

describe('FindingCRE Testing Suite', function() {
  this.timeout(120000)
  let driver
  let vars
  beforeEach(async function() {
    driver = await new Builder()
	.forBrowser('chrome').build()
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

  it('Add available space', async function(){
    await driver.get("https://local.phowma.com/listing")
    await driver.manage().window().maximize()
	await AddListing(driver, false)
    await AddAvailableSpace(driver)	  
  })	  
})
