use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("D2jGWop9j2ztWdVgkoa5cPM9t7FETdG7HoTEbERFnkGw");

#[program]
pub mod blogger_dapp {
    use super::*;

    pub fn create(ctx: Context<Create>) -> ProgramResult{
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_blogs = 0;
        base_account.admin = *ctx.accounts.user.key;
        base_account.amount_donated = 0;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult{
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;
        if base_account.admin != *user.key {
            return Err(ProgramError::IncorrectProgramId);
        }
        let rent_balance = Rent::get()?.minimum_balance(base_account.to_account_info().data_len());
        if **base_account.to_account_info().lamports.borrow() - rent_balance < amount{
            return Err(ProgramError::InsufficientFunds);
        }
        **base_account.to_account_info().try_borrow_mut_lamports()? -= amount;
        **user.to_account_info().try_borrow_mut_lamports()? += amount;
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult{
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.base_account.key(),
            amount
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.base_account.to_account_info()
            ]
        );

        (&mut ctx.accounts.base_account).amount_donated += amount;
        Ok(())
    }

    pub fn add_blog(ctx: Context<AddBlog> ,blog_title: String, blog_body: String) -> ProgramResult{
        let base_account = &mut ctx.accounts.base_account;
        let blog_account = &mut ctx.accounts.blog_account;
        let user = &mut ctx.accounts.user;

        blog_account.blog_title = blog_title;
        blog_account.blog_body = blog_body;
        blog_account.likes = 0;
        blog_account.admin = *user.to_account_info().key;
        blog_account.base_account = *base_account.to_account_info().key;

        base_account.total_blogs+=1;
        Ok(())
    }

    pub fn add_like(ctx: Context<AddLike>) -> ProgramResult{
        let blog_account = &mut ctx.accounts.blog_account;
        blog_account.likes += 1;
        Ok(())
    }

}

#[derive(Accounts)]
pub struct Create<'info>{
    #[account(init,payer=user, space = 100, seeds=["POST_DEMO".as_ref(),user.key().as_ref()],bump)]
    pub base_account: Account<'info,BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Withdraw<'info>{
    #[account(mut)]
    pub base_account: Account<'info,BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct Donate<'info>{
    #[account(mut)]
    pub base_account: Account<'info,BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AddBlog<'info>{
    #[account(init,payer=user, space = 9000)]
    pub blog_account: Account<'info,BlogAccount>,
    #[account(mut)]
    pub base_account: Account<'info,BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AddLike<'info>{
    #[account(mut)]
    pub blog_account: Account<'info,BlogAccount>,
    #[account(mut)]
    pub user: Signer<'info>
}


#[account]
pub struct BaseAccount{
    pub admin: Pubkey,
    pub amount_donated: u64,
    pub total_blogs : u64,
}

#[account]
pub struct BlogAccount{
    pub blog_title: String,
    pub blog_body: String,
    pub likes: u64,
    pub admin: Pubkey,
    pub base_account: Pubkey
}


