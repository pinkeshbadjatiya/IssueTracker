class PostsController < ApplicationController
    before_filter :authenticate_user!, only: [:create, :upvote]
    respond_to :html, :json

    def index
        respond_with Post.all
    end

    def create
        respond_with Post.create(post_params.merge(user_id: current_user.id))
    end

    def show

        # If project is public then all can see
        # Only Members and Owner can See all the issues with the project
        post = Post.where(:id => params[:id], :issecure => false)
        if(post.length > 0)
            respond_with post[0]
        elsif (Member.where(:user_id => current_user.id, :post_id => params[:id]).length > 0)
            respond_with Post.find(params[:id])
        elsif (Post.where(:user_id => current_user.id, :id => params[:id]).length > 0 )
            respond_with Post.find(params[:id])
        else
            respond_with ''
        end
    end

    def upvote
        # Only Members and Owner can upvote
        post = Post.find(params[:id])
        if ((Member.where(:user_id => current_user.id, :post_id => params[:id]).length > 0) or (Post.where(:user_id => current_user.id, :id => params[:id]).length > 0 ))
            if (Postvote.where(:user_id => current_user.id, :post_id => post.id).length == 0)
                c = Postvote.new
                c.update_attributes(:user_id => current_user.id)
                c.update_attributes(:post_id => post.id)
                c.save!
                post.increment!(:upvotes)
                respond_with(post)
            end
        end
    end

    def delpost
        post = Post.where(:id => params[:id], :user_id => current_user.id)
        if (post.length > 0)
            post.delete_all
            redirect_to :back
        end
    end


    def addmember
        res = User.where(:email => params[:eml])[0]
        post = Post.find(params[:id])

        if res
            if post
                if !(Member.where(:user_id => res, :post_id => post)[0])
                    if (Post.where(:id => post.id, :user_id => current_user.id).length > 0)
                        new_record = Member.new
                        new_record.update_attributes(:post => post)
                        new_record.update_attributes(:user_id => res.id)
                        new_record.save
                    end
                end
            end
        end
        redirect_to :back
    end


    def delmember
        res = User.where(:email => params[:eml])[0]
        post = Post.find(params[:id])

        if res
            if post
                if (Member.where(:user_id => res.id, :post_id => post)[0])
                    if (Post.where(:id => post.id, :user_id => current_user.id).length > 0)
                        Member.where(:user_id => res, :post_id => post).delete_all
                        #if new_record.destroy
                        #    post.increment!(:upvotes)
                        #end
                    end
                end
            end
        end
        redirect_to :back
    end


    private
    def post_params
        params.require(:post).permit(:link, :title, :upvotes, :issecure, :tags)
    end
end
