
require 'fileutils'

# TODO: Right now, the target directory ("projectAon") is relative to the current
# TODO: directory. It should be relative to this script location

# Tool to download book data from the Project Aon SVN
class BookData

    SVN_ROOT = "https://www.projectaon.org/data/tags/20151013"

    # Constructor
    # book_number: The book number
    # en_code: The english book code
    # es_code: The spanish book code
    # ill_authors: Array with illustrations authors directories names
    def initialize( book_number , en_code , es_code , ill_authors )
        @book_number = book_number
        @en_code = en_code
        @es_code = es_code
        @ill_authors = ill_authors
    end

    # Get the book code for a given language
    # language: 'en' or 'es'
    def book_code(language)
        language == 'en' ? @en_code : @es_code
    end

    # Get the local relative path for the book data
    def book_dir
        "projectAon/#{@book_number.to_s}"
    end

    # Download the book xml for a given language
    # language: 'en' or 'es'
    def download_xml(language)
        xml_file_name = "#{book_code(language)}.xml"
        cmd_line = "svn export #{SVN_ROOT}/" + 
            "#{language}/xml/#{xml_file_name} #{book_dir}/#{xml_file_name}"
        p cmd_line
        `#{cmd_line}`
    end

    # Get the svn absolute URL for illustrations directory of a given author / language
    def svn_illustrations_dir(language, author)
        books_set = language == 'en' ? 'lw' : 'ls'
        "#{SVN_ROOT}/#{language}/png/#{books_set}/#{book_code(language)}/ill/#{author}"
    end

    # Download illustrations
    # language: The language illustrations (en/es)
    # The illustrations author folder
    def download_illustrations(language, author)

        source_svn_dir = svn_illustrations_dir(language, author)
        target_dir = "#{book_dir}/ill_#{language}"

        FileUtils.mkdir_p( target_dir )
        cmd_line = "svn --force export #{source_svn_dir} #{target_dir}"
        p cmd_line
        `#{cmd_line}`
    end

    # Download the book cover
    def download_cover
        cover_path = "#{SVN_ROOT}/en/jpeg/lw/#{book_code('en')}/skins/ebook/cover.jpg"
        cmd_line = "svn export #{cover_path} #{book_dir}/cover.jpg"
        p cmd_line
        `#{cmd_line}`
    end

    def download_book_data
        FileUtils.mkdir_p( "projectAon/#{@book_number.to_s}" )
        download_cover
        download_xml('en')
        download_xml('es')
        @ill_authors.each do |author| 
            download_illustrations('en', author)
            download_illustrations('es', author)
        end
    end

    def self.download_extra_images( imagesUrlsTable )
        FileUtils.mkdir_p( 'projectAon/illExtra' )
        imagesUrlsTable.each do |url, fileName|
            cmd_line = "svn --force export #{SVN_ROOT}/#{url} projectAon/illExtra/#{fileName}"
            p cmd_line
            `#{cmd_line}`
        end
    end
end

# Recreate the directory
FileUtils.rm_rf( 'projectAon' )
FileUtils.mkdir_p( 'projectAon' )

# Download data
BookData.new( 1 , '01fftd' , '01hdlo' , [ 'chalk' ] ).download_book_data
BookData.new( 2 , '02fotw' , '02fsea'  , [ 'chalk' ] ).download_book_data
BookData.new( 3 , '03tcok' , '03lcdk'  , [ 'chalk' ] ).download_book_data
BookData.new( 4 , '04tcod' , '04eam'  , [ 'chalk' ] ).download_book_data

# Additional images:
BookData.download_extra_images({
    'en/png/lw/05sots/ill/chalk/small6.png' => 'book.png' ,
    'en/png/lw/07cd/ill/chalk/small5.png' => 'door.png'
})
