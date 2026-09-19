import { test, expect, chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
test('actual browser 200% zoom preserves form and core creation',async ({browserName})=>{
  test.skip(browserName!=='chromium','Chrome extension API verifies browser zoom; other engines retain responsive reflow coverage');
  const config=JSON.parse(fs.readFileSync('.runtime/test.json','utf8'));
  const extension=path.resolve('tests/fixtures/zoom-extension');
  const profile=fs.mkdtempSync(path.resolve('.runtime/zoom-profile-'));
  const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:{width:1440,height:900},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
  try{
    const worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker');
    const page=await context.newPage();await page.goto(config.APP_BASE_URL+'/login');
    const zoom=await worker.evaluate(async (base)=>{
      // chrome exists only in this isolated extension worker.
      const chromeApi=(globalThis as unknown as {chrome:{tabs:{query:(q:unknown)=>Promise<{id?:number;url?:string}[]>;setZoom:(id:number,value:number)=>Promise<void>;getZoom:(id:number)=>Promise<number>}}}).chrome;
      const tabs=await chromeApi.tabs.query({});const tab=tabs.find(t=>t.url?.startsWith(base));if(!tab?.id)throw new Error('Target tab not found');
      await chromeApi.tabs.setZoom(tab.id,2);return chromeApi.tabs.getZoom(tab.id);
    },config.APP_BASE_URL);
    expect(zoom).toBe(2);
    await page.getByLabel('邮箱',{exact:true}).fill('editor@example.test');await page.getByLabel('密码',{exact:true}).fill(config.FOCUSTASK_SEED_PASSWORD);await page.getByRole('button',{name:'登录',exact:true}).click();await expect(page).toHaveURL(/\/projects$/);
    await page.goto(config.APP_BASE_URL+'/projects/20000000-0000-4000-8000-000000000001/tasks');await page.getByRole('button',{name:'新建任务',exact:true}).click();
    const title=`真实缩放验证 ${Date.now()}`;await page.getByLabel('任务标题').fill(title);await expect(page.getByRole('button',{name:'创建任务',exact:true})).toBeInViewport();
    const formGeometry=await page.getByRole('dialog').evaluate(element=>{
      const rect=element.getBoundingClientRect();
      const submit=element.querySelector('button[type="submit"]')??element.querySelector('form button:not([type])');
      const button=submit!.getBoundingClientRect();
      return {viewport:{width:innerWidth,height:innerHeight},dialog:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scrollWidth:element.scrollWidth,clientWidth:element.clientWidth},submit:{x:button.x,y:button.y,width:button.width,height:button.height}};
    });
    expect(formGeometry.dialog.x).toBeGreaterThanOrEqual(0);expect(formGeometry.dialog.x+formGeometry.dialog.width).toBeLessThanOrEqual(formGeometry.viewport.width);
    expect(formGeometry.dialog.scrollWidth).toBeLessThanOrEqual(formGeometry.dialog.clientWidth);
    expect(formGeometry.submit.y).toBeGreaterThanOrEqual(0);expect(formGeometry.submit.y+formGeometry.submit.height).toBeLessThanOrEqual(formGeometry.viewport.height);
    expect(formGeometry.submit.x+formGeometry.submit.width).toBeLessThanOrEqual(formGeometry.viewport.width);
    await page.screenshot({path:'.runtime/screenshots/chromium-200-real-zoom-viewport.png',fullPage:false});
    await page.getByRole('dialog').getByLabel('负责人').selectOption('10000000-0000-4000-8000-000000000002');
    await page.getByRole('dialog').getByLabel('截止日期').fill('2099-01-01');
    const dateRect=await page.getByRole('dialog').getByLabel('截止日期').boundingBox();expect(dateRect).not.toBeNull();
    expect(dateRect!.y).toBeGreaterThanOrEqual(0);expect(dateRect!.y+dateRect!.height).toBeLessThanOrEqual(formGeometry.submit.y-20);
    await page.screenshot({path:'.runtime/screenshots/chromium-200-real-zoom-date.png',fullPage:false});
    await page.getByRole('button',{name:'创建任务',exact:true}).click();await expect(page.getByText(title,{exact:true})).toBeVisible();
    const dimensions=await page.evaluate(()=>({innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,devicePixelRatio}));expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
    fs.writeFileSync('.runtime/metrics/browser-zoom-viewport.json',JSON.stringify({at:new Date().toISOString(),zoom,formGeometry,dateRect,dimensions,createdTitle:title,result:'通过'},null,2));
  }finally{await context.close();}
});
