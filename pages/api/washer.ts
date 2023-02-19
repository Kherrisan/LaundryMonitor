// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio';

export interface WasherStatus {
    id: string,
    name?: string,
    status?: int,
    ddl?: string,
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<WasherStatus>
) {
    const id = req.query.id
    if (!id) {
        res.status(400).json({
            id: id as string,
            message: 'Washer ID is required'
        })
    }
    const indexResp = await fetch(`http://www.manlukj.com/wash/shop/machine_info/machine_id/${id}/type/pay.html`)
    const indexText = await indexResp.text()
    const name = cheerio.load(indexText)('div.top p').text().split(' ')[0]
    const ddl = cheerio.load(indexText)('.yomibox').attr('data')
    const resp = await fetch(`http://www.manlukj.com/wash/shop/update_devide.html`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Origin': 'http://www.manlukj.com',
            'Referer': 'http://www.manlukj.com/wash/shop/index.html',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: `device_id=${id}`
    })
    const data = await resp.json()
    return res.status(200).json({
        id: id as string,
        name,
        status: parseInt(data.wait) ,
        ddl,
        message: 'success'
    })

}
