import React, { useState, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuItem,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite sua mensagem aqui...',
  rows = 6,
}) => {
  const { contacts, groups } = useWhatsApp();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const formatText = (formatter: string) => {
    // Get selected text
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    switch (formatter) {
      case 'bold':
        formattedText = `*${selectedText}*`;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        break;
      case 'strikethrough':
        formattedText = `~${selectedText}~`;
        break;
      case 'link':
        // Prompt user for URL
        const url = prompt('Enter URL:');
        if (url) {
          formattedText = selectedText ? `[${selectedText}](${url})` : url;
        } else {
          return;
        }
        break;
      default:
        return;
    }

    // Replace selected text with formatted text
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  };

  const addEmoji = (emoji: any) => {
    onChange(value + emoji.native);
    setShowEmojiPicker(false);
  };
  
  // Função para inserir variáveis na mensagem
  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const newValue = value.substring(0, start) + variable + value.substring(start);
    onChange(newValue);
    
    setShowVariables(false);
    
    // Restaurar foco
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length
      );
    }, 0);
  };
  
  // Função para inserir menções de contatos
  const insertContactMention = (contact: { name: string }) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const mention = `@${contact.name}`;
    const newValue = value.substring(0, start) + mention + value.substring(start);
    onChange(newValue);
    
    setShowContacts(false);
    
    // Restaurar foco
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + mention.length,
        start + mention.length
      );
    }, 0);
  };

  return (
    <div className="border border-gray-300 rounded-md">
      {/* Toolbar */}
      <div className="flex items-center border-b border-gray-300 p-2 bg-green-50">
        <button
          type="button"
          className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded mr-1 w-8 h-8 flex items-center justify-center"
          onClick={() => formatText('bold')}
          title="Bold (WhatsApp: *text*)"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          type="button"
          className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded mr-1 w-8 h-8 flex items-center justify-center"
          onClick={() => formatText('italic')}
          title="Italic (WhatsApp: _text_)"
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          type="button"
          className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded mr-1 w-8 h-8 flex items-center justify-center"
          onClick={() => formatText('strikethrough')}
          title="Strikethrough (WhatsApp: ~text~)"
        >
          <i className="fas fa-strikethrough"></i>
        </button>
        <button
          type="button"
          className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded mr-1 w-8 h-8 flex items-center justify-center"
          onClick={() => formatText('link')}
          title="Link"
        >
          <i className="fas fa-link"></i>
        </button>
        <div className="h-4 w-px bg-green-300 mx-1"></div>
        
        {/* Emoji picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-2 text-amber-500 hover:text-amber-600 hover:bg-green-100 rounded w-8 h-8 flex items-center justify-center"
              title="Emoji"
            >
              <i className="far fa-smile"></i>
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-96 p-0 border-2 border-solid border-gray-200 shadow-lg rounded-md z-[1000]" 
            align="start" 
            side="bottom"
            sideOffset={5}
            style={{ backgroundColor: '#fff' }}
          >
            <div className="emoji-picker-container" style={{ width: '100%', maxHeight: '350px', overflow: 'auto' }}>
              <Picker 
                data={data} 
                onEmojiSelect={addEmoji}
                previewPosition="none"
                skinTonePosition="none"
                theme="light"
                style={{ width: '100%', height: '350px' }}
              />
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Variáveis */}
        <DropdownMenu open={showVariables} onOpenChange={setShowVariables}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-green-100 rounded ml-1 w-8 h-8 flex items-center justify-center"
              title="Variáveis"
            >
              <i className="fas fa-code"></i>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border shadow-md rounded-md min-w-40 z-[1000]">
            <DropdownMenuLabel className="text-blue-700">Inserir variáveis</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => insertVariable("{{nome}}")}>
                <span className="text-sm text-blue-600">Nome do contato</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertVariable("{{data}}")}>
                <span className="text-sm text-blue-600">Data atual</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertVariable("{{hora}}")}>
                <span className="text-sm text-blue-600">Hora atual</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Contatos e Grupos */}
        <DropdownMenu open={showContacts} onOpenChange={setShowContacts}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-green-100 rounded ml-1 w-8 h-8 flex items-center justify-center"
              title="Menções"
            >
              <i className="fas fa-at"></i>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border shadow-md rounded-md min-w-48 max-h-64 overflow-y-auto z-[1000]">
            <DropdownMenuLabel className="text-purple-700">Contatos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {contacts.slice(0, 10).map((contact) => (
                <DropdownMenuItem 
                  key={contact.id} 
                  onClick={() => insertContactMention(contact)}
                >
                  <span className="text-sm text-purple-600">{contact.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            {groups.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-purple-700">Grupos</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {groups.slice(0, 10).map((group) => (
                    <DropdownMenuItem 
                      key={group.id} 
                      onClick={() => insertContactMention(group)}
                    >
                      <span className="text-sm text-purple-600">{group.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* File attachment (disabled for now) */}
        <button
          type="button"
          className="p-2 text-gray-600 hover:text-gray-800 opacity-50 cursor-not-allowed ml-1 w-8 h-8 flex items-center justify-center"
          title="File attachment (Disabled)"
          disabled
        >
          <i className="fas fa-paperclip"></i>
        </button>
      </div>
      
      {/* Renderiza o texto com a formatação adequada */}
      <div className="relative">
        <textarea
          className="w-full p-3 text-sm focus:outline-none resize-none bg-transparent z-10 relative"
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        ></textarea>
        
        {/* Camada de highlight para mostrar menções e variáveis com cores */}
        <div 
          className="absolute top-0 left-0 right-0 text-sm p-3 pointer-events-none whitespace-pre-wrap z-0 opacity-80"
          style={{ 
            minHeight: `${rows * 1.5}rem`,
            color: 'transparent'
          }}
        >
          {/* Esse div aplica estilos às menções e variáveis sem interferir na edição */}
          {value.split(/(\{\{.*?\}\}|\@[^\s]+)/).map((part, i) => {
            if (part.match(/^\{\{.*?\}\}$/)) {
              // Destacar variáveis
              return <span key={i} className="bg-blue-100 text-blue-800 rounded px-0.5">{part}</span>;
            } else if (part.match(/^\@[^\s]+$/)) {
              // Destacar menções
              return <span key={i} className="bg-green-100 text-green-800 rounded px-0.5">{part}</span>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
